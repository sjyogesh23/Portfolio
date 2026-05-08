import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus, FiMaximize2, FiMinimize2, FiRefreshCw } from 'react-icons/fi'
import { useCollection, useDocument } from '@/hooks/useFirestore'
import { useThemeContext } from '@/App'
import SectionWrapper, { SectionHeading } from '@/components/ui/SectionWrapper'
import FieldGate from '@/components/ui/FieldGate'
import { SkeletonBox } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

// ── Category colour - reads from Firestore config, falls back to a palette ───
const DEFAULT_PALETTE = {
  light: ['#7C3AED','#0891B2','#D97706','#059669','#DB2777','#6366F1','#0D9488','#EA580C','#9333EA','#CA8A04'],
  dark:  ['#A78BFA','#22D3EE','#FCD34D','#34D399','#F472B6','#818CF8','#2DD4BF','#FB923C','#C084FC','#FACC15'],
}

// allCats = ordered category list (used for deterministic palette fallback)
function catColor(category, isDark, colorConfig, allCats) {
  const mode = isDark ? 'dark' : 'light'
  if (colorConfig?.[category]?.[mode]) return colorConfig[category][mode]
  const idx = (allCats ?? []).indexOf(category)
  const palette = DEFAULT_PALETTE[mode]
  return palette[idx >= 0 ? idx % palette.length : 0]
}

function groupByCategory(skills) {
  return skills.reduce((acc, s) => {
    const key = s.category ?? 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})
}

let allNodesActivated = false

export default function Skills() {
  const { data: allSkills, loading } = useCollection('skills')
  const { data: skillConfig }        = useDocument('config', 'skills')
  const skills = useMemo(() => allSkills.filter(s => s.visible !== false), [allSkills])
  const { isDark } = useThemeContext()

  const svgRef          = useRef(null)
  const containerRef    = useRef(null)
  const simRef          = useRef(null)
  const nodeElRef       = useRef(null)
  const linkElRef       = useRef(null)
  const zoomRef         = useRef(null)
  const svgSizeRef      = useRef({ W: 480, H: 380 })
  const isDraggingRef   = useRef(false)
  const hoverSourceRef  = useRef(null)
  const resizeTimerRef  = useRef(null)

  const [activeCategory, setActiveCategory] = useState('All')
  const [hoveredId,      setHoveredId]      = useState(null)
  const [selectedId,     setSelectedId]     = useState(null)
  const [clickedNodes,   setClickedNodes]   = useState(new Set())
  const [isFullscreen,   setIsFullscreen]   = useState(false)

  const categories = useMemo(() => {
    const fromSkills = [...new Set(skills.map(s => s.category).filter(Boolean))]
    const order      = skillConfig?.categoryOrder ?? []
    const ordered    = order.filter(c => fromSkills.includes(c))
    fromSkills.forEach(c => { if (!ordered.includes(c)) ordered.push(c) })
    return ['All', ...ordered]
  }, [skills, skillConfig])

  const filtered = useMemo(() =>
    activeCategory === 'All' ? skills : skills.filter(s => s.category === activeCategory),
    [skills, activeCategory]
  )

  const grouped = useMemo(() => groupByCategory(filtered), [filtered])

  const selectedSkill = useMemo(
    () => skills.find(s => s.id === selectedId) ?? null,
    [skills, selectedId]
  )

  // ── Zoom-to-fit all nodes (used for reset button) ────────────────────────
  const zoomFit = useCallback((animated = true) => {
    if (!svgRef.current || !zoomRef.current || !simRef.current) return
    const nodes = simRef.current.nodes()
    if (!nodes.length) return
    const { W, H } = svgSizeRef.current
    const pad  = 56
    const xs   = nodes.map(n => n.x)
    const ys   = nodes.map(n => n.y)
    const x0   = Math.min(...xs) - pad
    const x1   = Math.max(...xs) + pad
    const y0   = Math.min(...ys) - pad
    const y1   = Math.max(...ys) + pad
    const scale = Math.min(2, 0.9 * Math.min(W / (x1 - x0), H / (y1 - y0)))
    const tx    = W / 2 - scale * (x0 + x1) / 2
    const ty    = H / 2 - scale * (y0 + y1) / 2
    const t     = d3.zoomIdentity.translate(tx, ty).scale(scale)
    const sel   = d3.select(svgRef.current)
    if (animated) sel.transition().duration(500).ease(d3.easeCubicOut).call(zoomRef.current.transform, t)
    else          sel.call(zoomRef.current.transform, t)
  }, [])

  const zoomBy = useCallback((factor) => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, factor)
  }, [])

  // ── Fullscreen toggle ────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // ── ResizeObserver - SVG dimensions only, no simulation restart ──────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const applySize = () => {
      if (!svgRef.current) return
      const W = container.clientWidth || 480
      const H = document.fullscreenElement
        ? (container.clientHeight || window.innerHeight)
        : Math.min(480, Math.max(320, W * 0.85))
      svgSizeRef.current = { W, H }
      d3.select(svgRef.current).attr('width', W).attr('height', H)
      // Update center force silently - don't restart, just shift the attractor
      simRef.current?.force('center', d3.forceCenter(W / 2, H / 2))
    }

    const ro = new ResizeObserver(() => {
      // Debounce so rapid resize events (fullscreen CSS transition) don't pile up
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(applySize, 80)
    })

    ro.observe(container)
    return () => { ro.disconnect(); clearTimeout(resizeTimerRef.current) }
  }, [])

  // Zoom to fit after fullscreen is fully settled
  useEffect(() => {
    const timer = setTimeout(() => zoomFit(true), 150)
    return () => clearTimeout(timer)
  }, [isFullscreen, zoomFit])

  // ── Highlight node opacities (pure D3, no React re-render) ───────────────
  const highlightNode = useCallback((id) => {
    if (!nodeElRef.current || !linkElRef.current) return
    if (!id) {
      nodeElRef.current.selectAll('circle.main').attr('opacity', 0.88)
      linkElRef.current.attr('stroke-opacity', l => l.auto ? 0.65 : 0.8)
      return
    }
    // Derive connected set from actual D3 link data (includes auto-connections)
    const connected = new Set([id])
    linkElRef.current.each(l => {
      const src = typeof l.source === 'object' ? l.source.id : l.source
      const tgt = typeof l.target === 'object' ? l.target.id : l.target
      if (src === id) connected.add(tgt)
      if (tgt === id) connected.add(src)
    })
    nodeElRef.current.selectAll('circle.main')
      .attr('opacity', n => connected.has(n.id) ? 1 : 0.15)
    linkElRef.current
      .attr('stroke-opacity', l => {
        const src = typeof l.source === 'object' ? l.source.id : l.source
        const tgt = typeof l.target === 'object' ? l.target.id : l.target
        return (src === id || tgt === id) ? 0.9 : 0.04
      })
  }, [])

  // ── Pan to node - only when hover came from the LEFT LIST ────────────────
  const panToNode = useCallback((id) => {
    // Never pan when hovering a graph node directly (user's mouse IS on it)
    if (hoverSourceRef.current !== 'list') return
    if (!id || !svgRef.current || !zoomRef.current || !simRef.current) return

    // Don't pan while simulation is still moving significantly
    if (simRef.current.alpha() > 0.05) return

    const node = simRef.current.nodes().find(n => n.id === id)
    if (!node || node.x == null) return

    const { W, H } = svgSizeRef.current
    const t        = d3.zoomTransform(svgRef.current)
    const screenX  = t.applyX(node.x)
    const screenY  = t.applyY(node.y)

    // Comfortable inner margin - node must be this far from any edge to count as visible
    const margin = 80
    const inView = screenX >= margin && screenX <= W - margin &&
                   screenY >= margin && screenY <= H - margin
    if (inView) return

    const tx = W / 2 - t.k * node.x
    const ty = H / 2 - t.k * node.y
    d3.select(svgRef.current)
      .transition().duration(400).ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(t.k))
  }, [])

  useEffect(() => {
    highlightNode(hoveredId)
    panToNode(hoveredId)
  }, [hoveredId, highlightNode, panToNode])

  // ── Easter egg ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!allNodesActivated && filtered.length > 0 && clickedNodes.size >= filtered.length) {
      allNodesActivated = true
      toast('🧠 All nodes activated - neural network online!', { duration: 4000 })
    }
  }, [clickedNodes, filtered])

  // ── D3 graph ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container || filtered.length === 0) return

    const W = container.clientWidth || 480
    const H = document.fullscreenElement
      ? (container.clientHeight || window.innerHeight)
      : Math.min(480, Math.max(320, W * 0.85))
    svgSizeRef.current = { W, H }

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)
    // Prevent text-selection cursor while panning
    svg.style('user-select', 'none').style('-webkit-user-select', 'none')

    // Glow filter
    const defs   = svg.append('defs')
    const filter = defs.append('filter').attr('id', 'sk-glow')
    filter.append('feGaussianBlur').attr('stdDeviation', 3).attr('result', 'blur')
    const merge  = filter.append('feMerge')
    merge.append('feMergeNode').attr('in', 'blur')
    merge.append('feMergeNode').attr('in', 'SourceGraphic')

    const nodes  = filtered.map(s => ({ ...s }))
    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    // Build real links from relatedTo (deduplicated - only add A→B, skip B→A if A→B exists)
    const linkSet = new Set()
    const links   = []
    nodes.forEach(n => {
      ;(n.relatedTo ?? []).forEach(tid => {
        if (!nodeMap.has(tid)) return
        const key = [n.id, tid].sort().join('|')
        if (linkSet.has(key)) return
        linkSet.add(key)
        links.push({ source: n.id, target: tid, auto: false })
      })
    })

    // ── Fallback auto-connections - every node gets ≥ 2 links ───────────────
    // Priority: prefer already-connected nodes (joins isolated nodes into the
    // main cluster), then same-category, then any node.
    function addAutoLink(aId, bId) {
      if (aId === bId) return
      const key = [aId, bId].sort().join('|')
      if (linkSet.has(key)) return
      linkSet.add(key)
      links.push({ source: aId, target: bId, auto: true })
      linkedIds.add(aId)
      linkedIds.add(bId)
    }

    function pickPartners(n, count) {
      // Candidates sorted: already-connected same-cat > connected other-cat > isolated same-cat > any
      const candidates = nodes
        .filter(o => o.id !== n.id)
        .sort((a, b) => {
          const aConn = linkedIds.has(a.id), bConn = linkedIds.has(b.id)
          const aCat  = a.category === n.category, bCat = b.category === n.category
          return (bConn - aConn) * 2 + (bCat - aCat)
        })
      return candidates.slice(0, count)
    }

    const linkedIds = new Set()
    links.forEach(l => { linkedIds.add(l.source); linkedIds.add(l.target) })

    // First pass - connect all isolated nodes (those with 0 real links)
    const isolated = nodes.filter(n => !linkedIds.has(n.id))
    isolated.forEach(n => {
      pickPartners(n, 2).forEach(p => addAutoLink(n.id, p.id))
    })

    // Second pass - any node still under 2 total connections gets one more
    const linkCount = {}
    links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      linkCount[s] = (linkCount[s] ?? 0) + 1
      linkCount[t] = (linkCount[t] ?? 0) + 1
    })
    nodes.forEach(n => {
      if ((linkCount[n.id] ?? 0) < 2) {
        pickPartners(n, 1).forEach(p => addAutoLink(n.id, p.id))
      }
    })

    const linkColor     = isDark ? 'rgba(167,139,250,0.30)' : 'rgba(124,58,237,0.25)'
    const linkColorAuto = isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.15)'

    const sim = d3.forceSimulation(nodes)
      .force('link',      d3.forceLink(links).id(d => d.id)
                            .distance(l => l.auto ? 110 : 80)
                            .strength(l => l.auto ? 0.2 : 0.4))
      .force('charge',    d3.forceManyBody().strength(-260))
      .force('center',    d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(38))
      .alphaDecay(0.03)
    simRef.current = sim

    // ── Zoom ────────────────────────────────────────────────────────────
    const zoomGroup = svg.append('g').attr('class', 'zoom-root')

    const zoom = d3.zoom()
      .scaleExtent([0.15, 5])
      // Ignore mousedown/touchstart on nodes - let the drag handler own those
      .filter(ev => {
        if (ev.type === 'wheel') return true
        if (ev.type === 'dblclick') return false
        // If the pointer is over a node group, don't start a zoom-pan
        if (ev.target && ev.target.closest && ev.target.closest('g.node-g')) return false
        return !isDraggingRef.current
      })
      .on('zoom', ev => zoomGroup.attr('transform', ev.transform))

    zoomRef.current = zoom
    svg.call(zoom)

    // ── Links ────────────────────────────────────────────────────────────
    const linkEl = zoomGroup.append('g')
      .selectAll('line').data(links).join('line')
      .attr('stroke',           l => l.auto ? linkColorAuto : linkColor)
      .attr('stroke-width',     l => l.auto ? 1.0 : 1.4)
      .attr('stroke-opacity',   l => l.auto ? 0.65 : 0.8)
      .attr('stroke-dasharray', l => l.auto ? '5 5' : null)
      .style('pointer-events', 'none')
    linkElRef.current = linkEl

    // ── Nodes ────────────────────────────────────────────────────────────
    const nodeEl = zoomGroup.append('g')
      .selectAll('g').data(nodes).join('g')
      .attr('class', 'node-g')
      .style('cursor', 'grab')
      .call(
        d3.drag()
          .on('start', (ev, d) => {
            // Stop propagation so the zoom behavior doesn't also start a pan
            ev.sourceEvent.stopPropagation()
            isDraggingRef.current = true
            d3.select(ev.sourceEvent.target.closest('g.node-g') || ev.sourceEvent.target)
              .style('cursor', 'grabbing')
            if (!ev.active) sim.alphaTarget(0.25).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (ev, d) => {
            d.fx = ev.x; d.fy = ev.y
          })
          .on('end', (ev, d) => {
            isDraggingRef.current = false
            d3.select(ev.sourceEvent.target.closest('g.node-g') || ev.sourceEvent.target)
              .style('cursor', 'grab')
            if (!ev.active) sim.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )
    nodeElRef.current = nodeEl

    const cc = skillConfig?.categoryColors
    const allCats = categories

    // Glow halo
    nodeEl.append('circle')
      .attr('r', 28)
      .attr('fill', d => catColor(d.category, isDark, cc, allCats))
      .attr('opacity', 0.1)
      .attr('filter', 'url(#sk-glow)')
      .style('pointer-events', 'none')

    // Main circle
    nodeEl.append('circle')
      .classed('main', true)
      .attr('r', 24)
      .attr('fill', d => catColor(d.category, isDark, cc, allCats))
      .attr('stroke', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.88)

    // Label
    nodeEl.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '9.5px')
      .attr('font-weight', '600')
      .attr('font-family', 'Inter, sans-serif')
      .style('pointer-events', 'none')
      .each(function(d) {
        const words = d.name.split(' ')
        const el    = d3.select(this)
        if (words.length === 1) { el.text(d.name); return }
        el.text('')
        words.forEach((w, i) =>
          el.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? `${-(words.length - 1) * 6}px` : '12px')
            .text(w)
        )
      })

    nodeEl
      .on('mouseover', (_, d) => {
        hoverSourceRef.current = 'graph'
        setHoveredId(d.id)
      })
      .on('mouseout', () => {
        hoverSourceRef.current = null
        setHoveredId(null)
      })
      .on('click', (_, d) => {
        setSelectedId(id => id === d.id ? null : d.id)
        setClickedNodes(prev => new Set([...prev, d.id]))
      })

    sim.on('tick', () => {
      linkEl
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      nodeEl.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Auto zoom-to-fit once simulation has settled enough
    const fitTimer = setTimeout(() => zoomFit(true), 800)

    return () => {
      sim.stop()
      clearTimeout(fitTimer)
    }
  }, [filtered, isDark, zoomFit])

  // ── Color-only update - fires when admin changes a category color ─────────
  // Does NOT rebuild the graph, just re-fills the circles already in the DOM
  useEffect(() => {
    if (!nodeElRef.current) return
    const cc = skillConfig?.categoryColors
    nodeElRef.current.selectAll('circle')
      .attr('fill', d => catColor(d.category, isDark, cc, categories))
  }, [skillConfig?.categoryColors, isDark, categories])

  // ── Shared icon-button style ──────────────────────────────────────────────
  const iconBtn = 'w-8 h-8 flex items-center justify-center rounded-lg bg-bg/90 border border-border text-muted hover:text-ctext hover:bg-surface hover:border-primary/40 transition-all backdrop-blur-sm shadow-sm'

  return (
    <SectionWrapper id="skills" className="bg-surface/30">
      <SectionHeading label="Knowledge graph" title="Skills" />

      {/* Category filter */}
      <FieldGate field="filters">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSelectedId(null) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted hover:border-primary/50 hover:text-ctext'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FieldGate>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonBox className="h-80 rounded-2xl" />
          <SkeletonBox className="h-80 rounded-2xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-6 items-start">

          {/* ── LEFT: skill list ──────────────────────────────────────────── */}
          <div className="glass rounded-2xl border border-border/60 p-5 space-y-5 max-h-[520px] overflow-y-auto">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: catColor(category, isDark, skillConfig?.categoryColors, categories) }}
                  />
                  <p className="text-xs font-mono tracking-widest uppercase text-muted">
                    {category}
                  </p>
                </div>

                <div className="space-y-1 pl-4">
                  {items.map((skill, i) => {
                    const isHighlighted = hoveredId === skill.id || selectedId === skill.id
                    const isDimmed = (hoveredId || selectedId) && !isHighlighted
                    return (
                      <motion.button
                        key={skill.id}
                        className={`
                          w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg
                          text-sm transition-all duration-200
                          ${isHighlighted
                            ? 'bg-primary/10 text-ctext'
                            : isDimmed
                              ? 'text-muted/40'
                              : 'text-ctext hover:bg-surface/80'
                          }
                        `}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onMouseEnter={() => {
                          hoverSourceRef.current = 'list'
                          setHoveredId(skill.id)
                        }}
                        onMouseLeave={() => {
                          hoverSourceRef.current = null
                          setHoveredId(null)
                        }}
                        onClick={() => setSelectedId(id => id === skill.id ? null : skill.id)}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                            isHighlighted ? 'scale-150' : 'scale-100'
                          }`}
                          style={{ background: catColor(category, isDark, skillConfig?.categoryColors, categories) }}
                        />
                        <span className="flex-1 font-medium">{skill.name}</span>
                        {skill.relatedTo?.length > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-md transition-colors ${
                            isHighlighted
                              ? 'bg-primary/20 text-primary'
                              : 'bg-surface text-muted'
                          }`}>
                            {skill.relatedTo.length}
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT: D3 graph ───────────────────────────────────────────── */}
          <FieldGate field="graph">
            <div className="space-y-3">
              <div
                ref={containerRef}
                className="glass rounded-2xl border border-border/60 overflow-hidden relative group/graph"
              >
                <svg ref={svgRef} className="w-full block" />

                {/* ── Controls (always visible in fullscreen, fade-in on hover otherwise) */}
                <div className={`absolute top-3 right-3 flex flex-col gap-1.5 transition-opacity duration-200
                  ${isFullscreen ? 'opacity-100' : 'opacity-0 group-hover/graph:opacity-100'}`}>
                  <button onClick={() => zoomBy(1.4)}   className={iconBtn} title="Zoom in">
                    <FiPlus size={14} />
                  </button>
                  <button onClick={() => zoomBy(1/1.4)} className={iconBtn} title="Zoom out">
                    <FiMinus size={14} />
                  </button>
                  <button onClick={() => zoomFit(true)} className={iconBtn} title="Fit all nodes">
                    <FiRefreshCw size={13} />
                  </button>
                  <button onClick={toggleFullscreen}    className={iconBtn} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                    {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
                  </button>
                </div>

                {/* Hint - only in normal view */}
                {!isFullscreen && (
                  <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-muted/40 font-mono pointer-events-none select-none">
                    scroll to zoom · drag to pan · hover for controls
                  </p>
                )}
              </div>

              {/* Legend */}
              <FieldGate field="legend">
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.filter(c => c !== 'All').map(cat => (
                    <div key={cat} className="flex items-center gap-1.5 text-xs text-muted">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: catColor(cat, isDark, skillConfig?.categoryColors, categories) }}
                      />
                      {cat}
                    </div>
                  ))}
                </div>
              </FieldGate>
            </div>
          </FieldGate>
        </div>
      )}

      {/* ── Selected skill detail ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            className="mt-6 glass rounded-2xl p-5 border border-primary/25"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: catColor(selectedSkill.category, isDark, skillConfig?.categoryColors, categories) }}
                />
                <div>
                  <h3 className="font-bold text-ctext">{selectedSkill.name}</h3>
                  <p className="text-xs text-muted">{selectedSkill.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted hover:text-ctext text-xl leading-none"
              >×</button>
            </div>

            {selectedSkill.relatedTo?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-mono text-muted mb-2">Connected skills:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkill.relatedTo.map(id => {
                    const r = skills.find(s => s.id === id)
                    return r ? (
                      <button
                        key={id}
                        onClick={() => setSelectedId(id)}
                        className="px-2.5 py-1 rounded-full text-xs bg-surface border border-border text-ctext hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        {r.name}
                      </button>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
