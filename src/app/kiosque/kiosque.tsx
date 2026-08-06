'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  ShoppingBag, Plus, Minus, X, ChevronRight, Clock,
  CheckCircle, Phone, User, ArrowLeft, MapPin, Calendar,
} from 'lucide-react'
import { submitKiosqueOrder, type KiosqueItem } from '@/app/actions/kiosque'

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD     = '#C9A84C'
const GOLD_L   = '#E8CC7A'
const GOLD_D   = '#A88430'
const BG       = '#0C0A07'
const CARD     = '#1A1510'
const CARD2    = '#231D14'
const BORDER   = 'rgba(201,168,76,0.2)'
const BORDER_A = 'rgba(201,168,76,0.65)'
const W        = '#FFFFFF'
const W60      = 'rgba(255,255,255,0.65)'
const W30      = 'rgba(255,255,255,0.3)'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service       { id: string; name: string; category: string|null; description: string|null; duration: number|null; price: number|null; active: boolean }
interface StaffMember   { id: string; first_name: string; last_name: string; specialty: string|null; status: string; spa_id: string|null }
interface Appointment   { date: string; time: string|null; duration: number|null; staff_name: string|null; staff_id: string|null; status: string; spa_id: string|null }
interface Establishment { id: string; name: string; city: string }
interface CartItem      { service: Service; qty: number }
type Screen = 'welcome' | 'spa' | 'catalogue' | 'disponibilite' | 'info' | 'success'

interface Props {
  services:       Service[]
  staffList:      StaffMember[]
  appointments:   Appointment[]
  establishments: Establishment[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SLIDES = ['/kiosque/bg1.webp','/kiosque/bg2.webp','/kiosque/bg3.webp','/kiosque/bg4.webp','/kiosque/bg5.webp']

const WORK_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
                    '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
                    '18:00','18:30','19:00','19:30','20:00']

const CAT_CFG: Record<string, { label: string; desc: string }> = {
  'Massages':     { label: 'Massages & Modelages', desc: 'Détente et relaxation' },
  'Soins visage': { label: 'Soins du Visage',       desc: 'Éclat & rajeunissement' },
  'Soins corps':  { label: 'Hammam & Corps',        desc: 'Gommage, hammam' },
  'Beauté':       { label: 'Beauté & Onglerie',     desc: 'Cils, ongles, nail art' },
  'Coiffure':     { label: 'Coiffure',              desc: 'Brushing, couleur' },
  'Formules':     { label: 'Offres & Forfaits',     desc: 'Packages exclusifs' },
  'Épilations':   { label: 'Épilations',            desc: 'Cire et laser' },
}

const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const MONTHS_FR = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt       = (p: number) => p.toLocaleString('fr-FR') + ' F'
const dur       = (m: number) => m < 60 ? `${m} min` : `${Math.floor(m/60)}h${m%60 ? String(m%60).padStart(2,'0') : ''}`
const timeToMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
const initials  = (s: StaffMember) => (s.first_name[0]+s.last_name[0]).toUpperCase()

function next7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return { day: DAYS_FR[d.getDay()], num: d.getDate(), month: MONTHS_FR[d.getMonth()] }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, color:GOLD, margin:'4px 0' }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${GOLD_D})` }} />
      <span style={{ fontSize:13 }}>✦</span>
      <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${GOLD_D})` }} />
    </div>
  )
}

function Lotus({ size=60, color=GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M40 12C44 24 44 36 40 48C36 36 36 24 40 12Z" fill={color}/>
      <path d="M40 48C31 44 22 38 18 26C24 20 36 32 40 48Z" fill={color} opacity=".8"/>
      <path d="M40 48C49 44 58 38 62 26C56 20 44 32 40 48Z" fill={color} opacity=".8"/>
      <path d="M40 48C26 48 12 44 9 32C14 25 31 38 40 48Z" fill={color} opacity=".45"/>
      <path d="M40 48C54 48 68 44 71 32C66 25 49 38 40 48Z" fill={color} opacity=".45"/>
      <line x1="40" y1="48" x2="36" y2="68" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      <line x1="40" y1="48" x2="44" y2="68" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function KiosqueApp({ services, staffList, appointments, establishments }: Props) {
  const [screen,    setScreen]    = useState<Screen>('welcome')
  const [spa,       setSpa]       = useState<Establishment|null>(null)
  const [activeCat, setActiveCat] = useState<string|null>(null)
  const [cart,      setCart]      = useState<CartItem[]>([])
  const [date,      setDate]      = useState(next7Days()[0])
  const [staff,     setStaff]     = useState<StaffMember|null>(null)
  const [slot,      setSlot]      = useState<string|null>(null)
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [slideIdx,  setSlideIdx]  = useState(0)
  const [countdown, setCountdown] = useState(15)
  const [isPending, startTx]      = useTransition()
  const [winW,      setWinW]      = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)

  // Responsive breakpoints
  const isMobile  = winW < 768
  const isTablet  = winW < 1100

  useEffect(() => {
    const handle = () => setWinW(window.innerWidth)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const cats       = [...new Set(services.map(s => s.category).filter(Boolean))] as string[]
  const curCat     = activeCat ?? cats[0] ?? null
  const cartTotal  = cart.reduce((s, i) => s + (i.service.price??0)*i.qty, 0)
  const cartCount  = cart.reduce((s, i) => s + i.qty, 0)
  const cartDurMin = cart.reduce((s, i) => s + (i.service.duration??60)*i.qty, 0)
  const spaStaff   = staffList.filter(m => m.spa_id === spa?.id)

  // Inactivity 60s → welcome
  useEffect(() => {
    if (screen === 'success') return
    let t: ReturnType<typeof setTimeout>
    const reset = () => { clearTimeout(t); t = setTimeout(() => resetAll(), 60_000) }
    const evts = ['touchstart','click','mousemove','keydown'] as const
    evts.forEach(e => document.addEventListener(e, reset))
    reset()
    return () => { clearTimeout(t); evts.forEach(e => document.removeEventListener(e, reset)) }
  }, [screen])

  // Slideshow
  useEffect(() => {
    if (screen !== 'welcome') return
    const iv = setInterval(() => setSlideIdx(i => (i+1) % SLIDES.length), 5000)
    return () => clearInterval(iv)
  }, [screen])

  // Success countdown
  useEffect(() => {
    if (screen !== 'success') return
    setCountdown(15)
    const iv = setInterval(() => setCountdown(c => { if (c<=1) { resetAll(); return 15 } return c-1 }), 1000)
    return () => clearInterval(iv)
  }, [screen])

  function resetAll() {
    setScreen('welcome'); setSpa(null); setCart([]); setActiveCat(null)
    setDate(next7Days()[0]); setStaff(null); setSlot(null)
    setName(''); setPhone(''); setCountdown(15)
  }

  function addToCart(svc: Service) {
    setCart(p => {
      const i = p.findIndex(x => x.service.id === svc.id)
      if (i >= 0) { const n = [...p]; n[i] = {...n[i], qty: n[i].qty+1}; return n }
      return [...p, { service: svc, qty: 1 }]
    })
  }
  function setQty(id: string, qty: number) {
    qty <= 0 ? setCart(p => p.filter(x => x.service.id !== id))
             : setCart(p => p.map(x => x.service.id === id ? {...x, qty} : x))
  }

  function takenSlots(member: StaffMember, d: string): Set<string> {
    const taken = new Set<string>()
    const name = `${member.first_name} ${member.last_name}`
    appointments
      .filter(a => a.date === d && a.staff_name === name && ['confirmed','pending'].includes(a.status))
      .forEach(a => {
        if (!a.time) return
        const start = timeToMin(a.time)
        const end   = start + (a.duration ?? 60)
        WORK_SLOTS.forEach(s => { const sm = timeToMin(s); if (sm >= start && sm < end) taken.add(s) })
      })
    return taken
  }

  function isSlotFree(member: StaffMember, d: string, s: string): boolean {
    const taken = takenSlots(member, d)
    const start = timeToMin(s)
    const end   = start + cartDurMin
    return WORK_SLOTS.filter(sl => { const m = timeToMin(sl); return m >= start && m < end })
      .every(sl => !taken.has(sl))
  }

  function goToCatalogue() { setActiveCat(cats[0] ?? null); setScreen('catalogue') }

  function submit() {
    const items: KiosqueItem[] = cart.map(i => ({
      service_name: i.service.name,
      category:     i.service.category ?? '',
      duration:     i.service.duration ?? 60,
      price:        i.service.price ?? 0,
      qty:          i.qty,
    }))
    startTx(async () => {
      const res = await submitKiosqueOrder({
        spa_id:       spa?.id ?? '',
        client_name:  name,
        client_phone: phone,
        items,
        total:        cartTotal,
        date,
        time:         slot ?? '09:00',
        staff_name:   staff ? `${staff.first_name} ${staff.last_name}` : 'À définir',
        staff_id:     staff?.id ?? '',
      })
      if (res.success) setScreen('success')
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // WELCOME
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'welcome') return (
    <div onClick={() => setScreen('spa')}
      style={{ position:'fixed', inset:0, background:BG, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer' }}>
      {SLIDES.map((src, i) => (
        <div key={src} style={{ position:'absolute', inset:0, backgroundImage:`url(${src})`, backgroundSize:'cover', backgroundPosition:'center', opacity:i===slideIdx?1:0, transition:'opacity 1.5s ease-in-out' }} />
      ))}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(12,10,7,.65) 0%,rgba(12,10,7,.5) 50%,rgba(12,10,7,.8) 100%)' }} />

      <div style={{ position:'relative', zIndex:10, textAlign:'center', maxWidth:920, padding:'0 24px', width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:isMobile?16:28 }}>
          <Lotus size={isMobile?56:90}/>
        </div>
        <div style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?42:isTablet?64:88, fontWeight:600, color:W, letterSpacing:isMobile?2:5, lineHeight:1 }}>SPA & CO</div>
        <div style={{ fontFamily:'"Playfair Display",serif', color:GOLD, fontSize:isMobile?14:isTablet?18:24, letterSpacing:isMobile?8:14, margin:`${isMobile?6:8}px 0 ${isMobile?24:40}px` }}>— LUXURY —</div>
        <Divider/>
        <div style={{ margin:`${isMobile?24:44}px 0` }}>
          <p style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?22:isTablet?30:38, color:W, marginBottom:10, fontWeight:400 }}>Bienvenue chez SPA & CO Luxury</p>
          <p style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?15:isTablet?18:24, color:GOLD_L, fontStyle:'italic', marginBottom:12 }}>Prenez soin de vous, vous le méritez.</p>
          {!isMobile && <p style={{ fontSize:16, color:W60, lineHeight:1.8, maxWidth:560, margin:'0 auto' }}>Découvrez nos prestations et composez votre expérience<br/>bien-être en quelques instants.</p>}
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:isMobile?'16px 36px':'24px 68px', background:`linear-gradient(135deg,${GOLD},${GOLD_D})`, borderRadius:3, color:BG, fontSize:isMobile?16:24, fontWeight:700, letterSpacing:2, boxShadow:`0 0 50px rgba(201,168,76,.35)` }}>
          ✨ Commencer
        </div>
        <p style={{ marginTop:20, color:W30, fontSize:14, letterSpacing:2 }}>Touchez l&apos;écran pour commencer</p>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════
  // CHOIX DU SPA
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'spa') return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'14px 24px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Lotus size={22}/>
          <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:isMobile?15:18, letterSpacing:2 }}>
            SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
          </span>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:isMobile?24:40, overflowY:'auto' }}>
        <p style={{ color:GOLD, fontSize:11, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>Étape 1 / 4</p>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?32:52, color:W, marginBottom:8, textAlign:'center' }}>Choisissez votre spa</h1>
        <div style={{ width:isMobile?'100%':400, margin:'0 auto 32px' }}><Divider/></div>
        <div style={{ display:'flex', flexDirection:isMobile?'column':'row', gap:isMobile?16:32, justifyContent:'center', width:'100%', maxWidth:780 }}>
          {establishments.map(est => (
            <button key={est.id} onClick={() => { setSpa(est); goToCatalogue() }}
              style={{
                flex:1, maxWidth:isMobile?'100%':380, padding:isMobile?'28px 24px':'48px 40px',
                background:CARD, border:`2px solid ${BORDER}`,
                borderRadius:4, cursor:'pointer', textAlign:'center',
                transition:'border-color .2s, transform .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER_A; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              <Lotus size={isMobile?40:56}/>
              <div style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?28:40, color:W, marginTop:14, marginBottom:6 }}>{est.name}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:GOLD, fontSize:14 }}>
                <MapPin size={13}/> {est.city}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════
  // CATALOGUE
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'catalogue') {
    const svcs = services.filter(s => s.category === curCat && s.active)
    const colsPerRow = isMobile ? 1 : isTablet ? 2 : 'auto-fill'
    const gridCols   = colsPerRow === 1 ? '1fr' : colsPerRow === 2 ? '1fr 1fr' : 'repeat(auto-fill,minmax(240px,1fr))'

    return (
      <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:`10px ${isMobile?14:32}px`, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <button onClick={() => setScreen('spa')} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:`1px solid ${BORDER}`, color:W60, cursor:'pointer', padding:'6px 12px', borderRadius:2, fontSize:12 }}>
            <ArrowLeft size={13}/> {isMobile ? 'Spa' : 'Changer de spa'}
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Lotus size={22}/>
            <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:isMobile?14:18, letterSpacing:2 }}>
              SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {!isMobile && <span style={{ color:GOLD, fontSize:13, fontFamily:'"Playfair Display",serif', fontStyle:'italic' }}>{spa?.name}</span>}
            <div style={{ position:'relative', color:GOLD }}>
              <ShoppingBag size={22}/>
              {cartCount > 0 && <span style={{ position:'absolute', top:-7, right:-7, width:18, height:18, borderRadius:'50%', background:GOLD, color:BG, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
            </div>
          </div>
        </div>

        {/* Category tabs (mobile) or sidebar (desktop) */}
        {isMobile ? (
          <div style={{ display:'flex', overflowX:'auto', gap:8, padding:'10px 14px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
            {cats.map(cat => {
              const cfg = CAT_CFG[cat] ?? { label:cat, desc:'' }
              const isA = cat === curCat
              return (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  style={{ flexShrink:0, padding:'6px 14px', borderRadius:20, border:`1px solid ${isA?GOLD:BORDER}`, background:isA?GOLD:'transparent', color:isA?BG:W60, fontSize:12, fontWeight:isA?600:400, cursor:'pointer', whiteSpace:'nowrap' }}>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        ) : null}

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* Sidebar categories (tablet/desktop) */}
          {!isMobile && (
            <div style={{ width:isTablet?200:260, flexShrink:0, borderRight:`1px solid ${BORDER}`, overflowY:'auto', padding:'10px 0' }}>
              {cats.map(cat => {
                const cfg = CAT_CFG[cat] ?? { label:cat, desc:'' }
                const isA = cat === curCat
                return (
                  <button key={cat} onClick={() => setActiveCat(cat)} style={{ width:'100%', textAlign:'left', padding:'13px 18px', background:isA?CARD:'transparent', borderLeft:`3px solid ${isA?GOLD:'transparent'}`, border:'none', cursor:'pointer' }}>
                    <div style={{ color:isA?GOLD:W, fontSize:13, fontWeight:500 }}>{cfg.label}</div>
                    {!isTablet && <div style={{ color:W30, fontSize:11, marginTop:2 }}>{cfg.desc}</div>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Services grid */}
          <div style={{ flex:1, overflowY:'auto', padding:isMobile?'14px':isTablet?'16px 20px':'22px 26px', paddingBottom:isMobile?'100px':undefined }}>
            {curCat && <h2 style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:isMobile?20:26, marginBottom:6 }}>{CAT_CFG[curCat]?.label ?? curCat}</h2>}
            <Divider/>
            <div style={{ display:'grid', gridTemplateColumns:gridCols, gap:isMobile?10:14, marginTop:14 }}>
              {svcs.map(svc => {
                const inC = cart.find(i => i.service.id === svc.id)
                return (
                  <div key={svc.id} style={{ background:CARD, borderRadius:2, border:`1px solid ${inC?BORDER_A:BORDER}`, padding:isMobile?'14px 12px':'18px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ color:W, fontSize:isMobile?14:15, fontWeight:500, lineHeight:1.3 }}>{svc.name}</div>
                    {svc.description && !isMobile && <div style={{ color:W60, fontSize:12, lineHeight:1.5 }}>{svc.description}</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:'auto' }}>
                      {svc.duration && <span style={{ display:'flex', alignItems:'center', gap:3, color:W30, fontSize:12 }}><Clock size={12}/>{dur(svc.duration)}</span>}
                      {svc.price != null && <span style={{ color:GOLD, fontSize:isMobile?15:17, fontWeight:600, marginLeft:'auto' }}>{fmt(svc.price)}</span>}
                    </div>
                    {inC ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button onClick={() => setQty(svc.id, inC.qty-1)} style={{ width:32, height:32, borderRadius:2, border:`1px solid ${BORDER}`, background:CARD2, color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Minus size={13}/></button>
                        <span style={{ color:W, fontWeight:600, minWidth:18, textAlign:'center' }}>{inC.qty}</span>
                        <button onClick={() => setQty(svc.id, inC.qty+1)} style={{ width:32, height:32, borderRadius:2, border:`1px solid ${BORDER}`, background:CARD2, color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={13}/></button>
                        <span style={{ color:GOLD, fontSize:12, marginLeft:'auto' }}>✓</span>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(svc)} style={{ padding:'8px', background:'transparent', border:`1px solid ${GOLD_D}`, borderRadius:2, color:GOLD, fontSize:13, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                        <Plus size={14}/> Ajouter
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cart sidebar (tablet/desktop) */}
          {!isMobile && (
            <div style={{ width:isTablet?260:320, flexShrink:0, borderLeft:`1px solid ${BORDER}`, display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'14px 18px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:7 }}>
                <ShoppingBag size={14} color={GOLD}/>
                <span style={{ color:W, fontSize:13, fontWeight:500 }}>Votre sélection</span>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>
                {cart.length === 0 ? (
                  <div style={{ color:W30, fontSize:13, textAlign:'center', marginTop:36, lineHeight:2 }}>
                    <ShoppingBag size={32} style={{ marginBottom:8, opacity:.2 }}/><br/>
                    Votre sélection est vide.<br/>Choisissez une prestation.
                  </div>
                ) : cart.map(item => (
                  <div key={item.service.id} style={{ borderBottom:`1px solid ${BORDER}`, paddingBottom:10, marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:6 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ color:W, fontSize:13, lineHeight:1.3 }}>{item.service.name}</div>
                        {item.service.duration && <div style={{ color:W30, fontSize:11, marginTop:1 }}>{dur(item.service.duration)}</div>}
                      </div>
                      <button onClick={() => setQty(item.service.id, 0)} style={{ background:'none', border:'none', color:W30, cursor:'pointer', padding:2 }}><X size={12}/></button>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <button onClick={() => setQty(item.service.id, item.qty-1)} style={{ width:24, height:24, borderRadius:2, border:`1px solid ${BORDER}`, background:'transparent', color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Minus size={10}/></button>
                        <span style={{ color:W, fontSize:12, minWidth:14, textAlign:'center' }}>{item.qty}</span>
                        <button onClick={() => setQty(item.service.id, item.qty+1)} style={{ width:24, height:24, borderRadius:2, border:`1px solid ${BORDER}`, background:'transparent', color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={10}/></button>
                      </div>
                      <span style={{ color:GOLD, fontSize:13, fontWeight:600 }}>{fmt((item.service.price??0)*item.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'14px 18px', borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
                {cart.length > 0 && <div style={{ fontSize:11, color:W30, marginBottom:5, display:'flex', alignItems:'center', gap:3 }}><Clock size={11}/> {dur(cartDurMin)}</div>}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ color:W60, fontSize:12 }}>Total</span>
                  <span style={{ color:GOLD, fontSize:18, fontWeight:700 }}>{fmt(cartTotal)}</span>
                </div>
                <button onClick={() => cart.length > 0 && setScreen('disponibilite')} disabled={cart.length === 0}
                  style={{ width:'100%', padding:'13px', background:cart.length>0?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:cart.length>0?BG:W30, fontSize:13, fontWeight:700, letterSpacing:1, cursor:cart.length>0?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  Choisir un créneau <ChevronRight size={15}/>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom bar */}
        {isMobile && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 16px', background:CARD2, borderTop:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:W60, fontSize:11 }}>{cartCount} prestation{cartCount>1?'s':''} · {dur(cartDurMin)}</div>
              <div style={{ color:GOLD, fontSize:17, fontWeight:700 }}>{fmt(cartTotal)}</div>
            </div>
            <button onClick={() => cart.length > 0 && setScreen('disponibilite')} disabled={cart.length === 0}
              style={{ flexShrink:0, padding:'13px 20px', background:cart.length>0?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.08)', border:'none', borderRadius:2, color:cart.length>0?BG:W30, fontSize:13, fontWeight:700, cursor:cart.length>0?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:6 }}>
              Créneau <ChevronRight size={14}/>
            </button>
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // DISPONIBILITÉ
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'disponibilite') {
    const days       = next7Days()
    const freeSlots  = staff ? WORK_SLOTS.filter(s => isSlotFree(staff, date, s)) : []
    const canContinue = !!staff && !!slot

    return (
      <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:`10px ${isMobile?14:32}px`, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <button onClick={() => setScreen('catalogue')} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:`1px solid ${BORDER}`, color:W60, cursor:'pointer', padding:'6px 12px', borderRadius:2, fontSize:12 }}>
            <ArrowLeft size={13}/> Retour
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Lotus size={22}/>
            <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:isMobile?14:18, letterSpacing:2 }}>
              SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
            </span>
          </div>
          <div style={{ width:80 }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:`${isMobile?16:32}px ${isMobile?14:48}px` }}>
          <p style={{ color:GOLD, fontSize:11, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>Étape 3 / 4</p>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?26:44, color:W, marginBottom:6 }}>Choisissez votre créneau</h1>
          <Divider/>

          <div style={{ marginTop:isMobile?20:36, display:'grid', gridTemplateColumns:isMobile?'1fr':'minmax(0,1fr) minmax(0,1fr)', gap:isMobile?24:48 }}>

            {/* Left: Date + Therapist */}
            <div>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>
                <Calendar size={12} style={{ verticalAlign:'middle', marginRight:5 }}/>
                Choisissez une date
              </p>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6 }}>
                {days.map(d => {
                  const { day, num, month } = fmtDate(d)
                  const isA = d === date
                  return (
                    <button key={d} onClick={() => { setDate(d); setSlot(null) }}
                      style={{ flexShrink:0, width:isMobile?62:80, padding:`${isMobile?10:14}px 8px`, background:isA?`linear-gradient(135deg,${GOLD},${GOLD_D})`:CARD, border:`1px solid ${isA?GOLD:BORDER}`, borderRadius:2, cursor:'pointer', textAlign:'center' }}>
                      <div style={{ color:isA?BG:W60, fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>{day}</div>
                      <div style={{ color:isA?BG:W, fontSize:isMobile?20:26, fontWeight:700, lineHeight:1.2 }}>{num}</div>
                      <div style={{ color:isA?BG:W60, fontSize:10, textTransform:'uppercase' }}>{month}</div>
                    </button>
                  )
                })}
              </div>

              <p style={{ color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', margin:'24px 0 12px' }}>
                <User size={12} style={{ verticalAlign:'middle', marginRight:5 }}/>
                Choisissez votre thérapeute
              </p>
              {spaStaff.length === 0 ? (
                <p style={{ color:W30, fontSize:13 }}>Aucun thérapeute disponible pour ce spa.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {spaStaff.map(m => {
                    const taken = takenSlots(m, date)
                    const free  = WORK_SLOTS.filter(s => !taken.has(s))
                    const isA   = staff?.id === m.id
                    return (
                      <button key={m.id} onClick={() => { setStaff(m); setSlot(null) }}
                        style={{ display:'flex', alignItems:'center', gap:12, padding:`${isMobile?10:14}px 14px`, background:isA?CARD2:CARD, border:`1px solid ${isA?BORDER_A:BORDER}`, borderRadius:2, cursor:'pointer', textAlign:'left' }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:isA?GOLD:CARD2, border:`2px solid ${isA?GOLD:BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', color:isA?BG:W60, fontWeight:700, fontSize:13, flexShrink:0 }}>
                          {initials(m)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color:isA?GOLD:W, fontSize:14, fontWeight:500 }}>{m.first_name} {m.last_name}</div>
                          <div style={{ color:W30, fontSize:11, marginTop:1 }}>{m.specialty ?? '—'}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ color:isA?GOLD:W60, fontSize:12 }}>{free.length} créneaux</div>
                          <div style={{ color:W30, fontSize:10 }}>disponibles</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Time slots */}
            <div>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:12 }}>
                <Clock size={12} style={{ verticalAlign:'middle', marginRight:5 }}/>
                Choisissez l&apos;heure de début
                {cartDurMin > 0 && <span style={{ color:W30, fontWeight:400, marginLeft:6, letterSpacing:0, textTransform:'none', fontSize:11 }}>· {dur(cartDurMin)}</span>}
              </p>

              {!staff ? (
                <div style={{ color:W30, fontSize:13, padding:'24px 0' }}>← Sélectionnez d&apos;abord un thérapeute</div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${isMobile?3:4},1fr)`, gap:isMobile?6:8 }}>
                  {WORK_SLOTS.map(s => {
                    const isFree = isSlotFree(staff, date, s)
                    const isA    = s === slot
                    return (
                      <button key={s} onClick={() => isFree && setSlot(s)} disabled={!isFree}
                        style={{
                          padding:`${isMobile?10:12}px 6px`, borderRadius:2,
                          border:`1px solid ${isA?GOLD:isFree?BORDER:'transparent'}`,
                          background: isA?`linear-gradient(135deg,${GOLD},${GOLD_D})` : isFree?CARD:'rgba(255,255,255,.03)',
                          color: isA?BG : isFree?W:W30,
                          cursor: isFree?'pointer':'not-allowed',
                          fontSize:isMobile?13:14, fontWeight:isA?700:400,
                          textDecoration: isFree?'none':'line-through',
                          opacity: isFree?1:.4,
                        }}>
                        {s}
                      </button>
                    )
                  })}
                </div>
              )}

              {staff && slot && (
                <div style={{ marginTop:20, padding:'14px 16px', background:CARD2, border:`1px solid ${BORDER_A}`, borderRadius:2 }}>
                  <p style={{ color:GOLD, fontSize:10, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Récapitulatif du créneau</p>
                  <div style={{ color:W, fontSize:14 }}>{fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month} · {slot}</div>
                  <div style={{ color:W60, fontSize:12, marginTop:3 }}>{staff.first_name} {staff.last_name} · {dur(cartDurMin)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding:`14px ${isMobile?16:48}px`, borderTop:`1px solid ${BORDER}`, flexShrink:0, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={() => canContinue && setScreen('info')} disabled={!canContinue}
            style={{ width:isMobile?'100%':undefined, padding:`${isMobile?14:16}px ${isMobile?16:48}px`, background:canContinue?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:canContinue?BG:W30, fontSize:isMobile?14:16, fontWeight:700, letterSpacing:1, cursor:canContinue?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            Renseigner mes coordonnées <ChevronRight size={16}/>
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // INFO
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'info') {
    const ok = name.trim().length >= 2 && phone.trim().length >= 6
    return (
      <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:`10px ${isMobile?14:32}px`, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <button onClick={() => setScreen('disponibilite')} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:`1px solid ${BORDER}`, color:W60, cursor:'pointer', padding:'6px 12px', borderRadius:2, fontSize:12 }}>
            <ArrowLeft size={13}/> Retour
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Lotus size={22}/>
            <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:isMobile?14:18, letterSpacing:2 }}>
              SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
            </span>
          </div>
          <div style={{ width:80 }} />
        </div>

        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:isMobile?'column':'row' }}>

          {/* Form */}
          <div style={{ flex:1, padding:isMobile?'24px 16px':isTablet?'36px 40px':'48px 64px' }}>
            <div style={{ maxWidth:520 }}>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>Étape 4 / 4</p>
              <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?28:46, color:W, marginBottom:6 }}>Vos informations</h1>
              <Divider/>
              <p style={{ color:W60, fontSize:isMobile?13:15, margin:'16px 0 24px', lineHeight:1.8 }}>
                Renseignez vos coordonnées pour que notre équipe puisse vous accueillir immédiatement.
              </p>

              {/* Summary on mobile */}
              {isMobile && (
                <div style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:2, padding:'12px 14px', marginBottom:20 }}>
                  <div style={{ color:W60, fontSize:11, marginBottom:4 }}>{spa?.name} · {fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month}</div>
                  <div style={{ color:GOLD, fontSize:15, fontWeight:600 }}>{slot}</div>
                  {staff && <div style={{ color:W60, fontSize:12, marginTop:2 }}>{staff.first_name} {staff.last_name}</div>}
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:8, borderTop:`1px solid ${BORDER}` }}>
                    <span style={{ color:W60, fontSize:12 }}>Total</span>
                    <span style={{ color:GOLD, fontSize:16, fontWeight:700 }}>{fmt(cartTotal)}</span>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                <div>
                  <label style={{ display:'flex', alignItems:'center', gap:6, color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:8 }}>
                    <User size={11}/> Nom et prénom *
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet"
                    style={{ width:'100%', padding:isMobile?'14px 16px':'18px 22px', background:CARD, border:`1px solid ${name?BORDER_A:BORDER}`, borderRadius:2, color:W, fontSize:isMobile?16:20, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ display:'flex', alignItems:'center', gap:6, color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:8 }}>
                    <Phone size={11}/> Téléphone *
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 000 00 00"
                    style={{ width:'100%', padding:isMobile?'14px 16px':'18px 22px', background:CARD, border:`1px solid ${phone?BORDER_A:BORDER}`, borderRadius:2, color:W, fontSize:isMobile?16:20, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <button onClick={submit} disabled={!ok || isPending}
                  style={{ marginTop:4, padding:isMobile?'16px':'20px', background:ok?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:ok?BG:W30, fontSize:isMobile?15:18, fontWeight:700, letterSpacing:1.5, cursor:ok?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:isPending?.7:1 }}>
                  {isPending ? 'Envoi en cours…' : <><CheckCircle size={17}/> Valider ma réservation</>}
                </button>
              </div>
            </div>
          </div>

          {/* Summary panel (tablet/desktop) */}
          {!isMobile && (
            <div style={{ width:isTablet?280:340, flexShrink:0, borderLeft:`1px solid ${BORDER}`, padding:'28px 22px', overflowY:'auto' }}>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Récapitulatif</p>
              <div style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:2, padding:'12px 14px', marginBottom:18 }}>
                <div style={{ color:W60, fontSize:11, letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>Créneau</div>
                <div style={{ color:W, fontSize:13 }}>{spa?.name} · {fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month}</div>
                <div style={{ color:GOLD, fontSize:15, fontWeight:600, marginTop:3 }}>{slot}</div>
                {staff && <div style={{ color:W60, fontSize:12, marginTop:3 }}>{staff.first_name} {staff.last_name}</div>}
              </div>
              {cart.map(item => (
                <div key={item.service.id} style={{ borderBottom:`1px solid ${BORDER}`, paddingBottom:10, marginBottom:10, display:'flex', justifyContent:'space-between', gap:6 }}>
                  <div>
                    <div style={{ color:W, fontSize:13 }}>{item.service.name}</div>
                    {item.qty > 1 && <div style={{ color:W30, fontSize:11 }}>× {item.qty}</div>}
                  </div>
                  <div style={{ color:GOLD, fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>{fmt((item.service.price??0)*item.qty)}</div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:14, paddingTop:10, borderTop:`1px solid ${BORDER}` }}>
                <span style={{ color:W60 }}>Total</span>
                <span style={{ color:GOLD, fontSize:20, fontWeight:700 }}>{fmt(cartTotal)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // SUCCESS
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:isMobile?20:40, overflowY:'auto' }}>
      <div style={{ width:isMobile?80:110, height:isMobile?80:110, borderRadius:'50%', border:`2px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:isMobile?18:28, boxShadow:`0 0 60px rgba(201,168,76,.2)` }}>
        <CheckCircle size={isMobile?38:52} color={GOLD} strokeWidth={1.5}/>
      </div>
      <Lotus size={isMobile?26:34}/>
      <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?36:58, color:W, margin:`${isMobile?12:18}px 0 6px` }}>Réservation confirmée !</h1>
      <div style={{ width:isMobile?200:300, margin:'0 auto 20px' }}><Divider/></div>
      <p style={{ color:W60, fontSize:isMobile?14:18, lineHeight:1.8, maxWidth:520, marginBottom:6 }}>
        Notre équipe vous accueillera dans quelques instants.<br/>Merci de vous présenter à la réception.
      </p>
      <p style={{ fontFamily:'"Playfair Display",serif', color:GOLD_L, fontSize:isMobile?14:18, fontStyle:'italic', marginBottom:isMobile?20:36 }}>Merci de votre confiance.</p>

      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:2, padding:`${isMobile?16:24}px ${isMobile?16:40}px`, maxWidth:480, width:'100%', marginBottom:isMobile?20:36, textAlign:'left' }}>
        <div style={{ color:GOLD, fontSize:10, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Votre réservation</div>
        <div style={{ color:W, fontSize:isMobile?13:15, marginBottom:3 }}>
          📍 {spa?.name} · {fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month} à {slot}
        </div>
        {staff && <div style={{ color:W60, fontSize:12, marginBottom:12 }}>👤 {staff.first_name} {staff.last_name}</div>}
        {cart.map(item => (
          <div key={item.service.id} style={{ display:'flex', justifyContent:'space-between', color:W, fontSize:isMobile?13:14, padding:'5px 0', borderBottom:`1px solid ${BORDER}` }}>
            <span>{item.service.name}{item.qty>1?` × ${item.qty}`:''}</span>
            <span style={{ color:GOLD }}>{fmt((item.service.price??0)*item.qty)}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, color:W }}>
          <span>Total</span><span style={{ color:GOLD, fontWeight:700, fontSize:isMobile?16:20 }}>{fmt(cartTotal)}</span>
        </div>
      </div>

      <p style={{ color:W30, fontSize:14 }}>Retour à l&apos;accueil dans <span style={{ color:GOLD }}>{countdown}</span>s</p>
      <button onClick={resetAll} style={{ marginTop:10, background:'none', border:`1px solid ${BORDER}`, color:W60, padding:'10px 24px', borderRadius:2, cursor:'pointer', fontSize:13, letterSpacing:1 }}>
        Nouvelle réservation
      </button>
    </div>
  )
}
