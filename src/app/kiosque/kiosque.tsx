'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  ShoppingBag, Plus, Minus, X, ChevronRight, Clock,
  CheckCircle, Phone, User, ArrowLeft,
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
interface Establishment { id: string; name: string; city: string }
interface CartItem      { service: Service; qty: number }
type Screen = 'welcome' | 'catalogue' | 'info' | 'success'

interface Props {
  services:       Service[]
  staffList:      unknown[]
  appointments:   unknown[]
  establishments: Establishment[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SLIDES = ['/kiosque/bg1.webp','/kiosque/bg2.webp','/kiosque/bg3.webp','/kiosque/bg4.webp','/kiosque/bg5.webp']

const CAT_CFG: Record<string, { label: string; desc: string }> = {
  'Massages':     { label: 'Massages & Modelages', desc: 'Détente et relaxation' },
  'Soins visage': { label: 'Soins du Visage',       desc: 'Éclat & rajeunissement' },
  'Soins corps':  { label: 'Hammam & Corps',        desc: 'Gommage, hammam' },
  'Beauté':       { label: 'Beauté & Onglerie',     desc: 'Cils, ongles, nail art' },
  'Coiffure':     { label: 'Coiffure',              desc: 'Brushing, couleur' },
  'Formules':     { label: 'Offres & Forfaits',     desc: 'Packages exclusifs' },
  'Épilations':   { label: 'Épilations',            desc: 'Cire et laser' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (p: number) => p.toLocaleString('fr-FR') + ' F'
const dur = (m: number) => m < 60 ? `${m} min` : `${Math.floor(m/60)}h${m%60 ? String(m%60).padStart(2,'0') : ''}`

function todayLabel() {
  const d = new Date()
  const days   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
  const months = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
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
export function KiosqueApp({ services, establishments }: Props) {
  const [screen,    setScreen]    = useState<Screen>('welcome')
  const [spa,       setSpa]       = useState<Establishment|null>(null)
  const [activeCat, setActiveCat] = useState<string|null>(null)
  const [cart,      setCart]      = useState<CartItem[]>([])
  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [slideIdx,  setSlideIdx]  = useState(0)
  const [countdown, setCountdown] = useState(15)
  const [isPending, startTx]      = useTransition()
  const [winW,      setWinW]      = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)

  const isMobile = winW < 768
  const isTablet = winW < 1100

  useEffect(() => {
    setWinW(window.innerWidth)
    const handle = () => setWinW(window.innerWidth)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const cats      = [...new Set(services.map(s => s.category).filter(Boolean))] as string[]
  const curCat    = activeCat ?? cats[0] ?? null
  const cartTotal = cart.reduce((s, i) => s + (i.service.price??0)*i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartDur   = cart.reduce((s, i) => s + (i.service.duration??60)*i.qty, 0)

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

  function goToCatalogue() { setActiveCat(cats[0] ?? null); setScreen('catalogue') }

  function submit() {
    const today = new Date().toISOString().split('T')[0]
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
        date:         today,
        time:         null,
        staff_name:   'À définir',
        staff_id:     '',
      })
      if (res.success) setScreen('success')
    })
  }

  // ════════════════════════════════════════════════════════════════════════
  // WELCOME
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'welcome') return (
    <div onClick={() => { setSpa(establishments.find(e => e.name === 'Mermoz') ?? establishments[0] ?? null); goToCatalogue() }}
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
  // CATALOGUE
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'catalogue') {
    const svcs = services.filter(s => s.category === curCat && s.active)
    const gridCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fill,minmax(240px,1fr))'

    return (
      <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:`10px ${isMobile?14:32}px`, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <button onClick={() => setScreen('welcome')} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:`1px solid ${BORDER}`, color:W60, cursor:'pointer', padding:'6px 12px', borderRadius:2, fontSize:12 }}>
            <ArrowLeft size={13}/> Accueil
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Lotus size={22}/>
            <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:isMobile?14:18, letterSpacing:2 }}>
              SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {!isMobile && <span style={{ color:GOLD, fontSize:13, fontFamily:'"Playfair Display",serif', fontStyle:'italic' }}>Mermoz</span>}
            <div style={{ position:'relative', color:GOLD }}>
              <ShoppingBag size={22}/>
              {cartCount > 0 && <span style={{ position:'absolute', top:-7, right:-7, width:18, height:18, borderRadius:'50%', background:GOLD, color:BG, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
            </div>
          </div>
        </div>

        {/* Category chips (mobile) */}
        {isMobile && (
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
        )}

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* Sidebar (tablet/desktop) */}
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
                {cart.length > 0 && <div style={{ fontSize:11, color:W30, marginBottom:5, display:'flex', alignItems:'center', gap:3 }}><Clock size={11}/> {dur(cartDur)}</div>}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ color:W60, fontSize:12 }}>Total</span>
                  <span style={{ color:GOLD, fontSize:18, fontWeight:700 }}>{fmt(cartTotal)}</span>
                </div>
                <button onClick={() => cart.length > 0 && setScreen('info')} disabled={cart.length === 0}
                  style={{ width:'100%', padding:'13px', background:cart.length>0?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:cart.length>0?BG:W30, fontSize:13, fontWeight:700, letterSpacing:1, cursor:cart.length>0?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                  Renseigner mes coordonnées <ChevronRight size={15}/>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom bar */}
        {isMobile && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 16px', background:CARD2, borderTop:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:W60, fontSize:11 }}>{cartCount} prestation{cartCount>1?'s':''} · {dur(cartDur)}</div>
              <div style={{ color:GOLD, fontSize:17, fontWeight:700 }}>{fmt(cartTotal)}</div>
            </div>
            <button onClick={() => cart.length > 0 && setScreen('info')} disabled={cart.length === 0}
              style={{ flexShrink:0, padding:'13px 20px', background:cart.length>0?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.08)', border:'none', borderRadius:2, color:cart.length>0?BG:W30, fontSize:13, fontWeight:700, cursor:cart.length>0?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:6 }}>
              Continuer <ChevronRight size={14}/>
            </button>
          </div>
        )}
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

        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:isMobile?'column':'row' }}>

          {/* Form */}
          <div style={{ flex:1, padding:isMobile?'24px 16px':isTablet?'36px 40px':'48px 64px' }}>
            <div style={{ maxWidth:520 }}>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>Étape 2 / 2</p>
              <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?28:46, color:W, marginBottom:6 }}>Vos informations</h1>
              <Divider/>
              <p style={{ color:W60, fontSize:isMobile?13:15, margin:'16px 0 24px', lineHeight:1.8 }}>
                Renseignez vos coordonnées pour que notre équipe puisse vous accueillir immédiatement.
              </p>

              {/* Mobile recap */}
              {isMobile && cart.length > 0 && (
                <div style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:2, padding:'12px 14px', marginBottom:20 }}>
                  <div style={{ color:W60, fontSize:11, marginBottom:6 }}>{cartCount} prestation{cartCount>1?'s':''} · {dur(cartDur)}</div>
                  {cart.map(item => (
                    <div key={item.service.id} style={{ display:'flex', justifyContent:'space-between', color:W, fontSize:12, padding:'3px 0' }}>
                      <span>{item.service.name}{item.qty>1?` × ${item.qty}`:''}</span>
                      <span style={{ color:GOLD }}>{fmt((item.service.price??0)*item.qty)}</span>
                    </div>
                  ))}
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

          {/* Recap panel (tablet/desktop) */}
          {!isMobile && (
            <div style={{ width:isTablet?280:340, flexShrink:0, borderLeft:`1px solid ${BORDER}`, padding:'28px 22px', overflowY:'auto' }}>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Récapitulatif</p>
              <div style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:2, padding:'12px 14px', marginBottom:18 }}>
                <div style={{ color:W60, fontSize:11, letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>Spa</div>
                <div style={{ color:W, fontSize:13 }}>Mermoz · {todayLabel()}</div>
                <div style={{ color:W60, fontSize:12, marginTop:3 }}>{dur(cartDur)} de soin</div>
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
      <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:isMobile?36:58, color:W, margin:`${isMobile?12:18}px 0 6px` }}>Réservation enregistrée !</h1>
      <div style={{ width:isMobile?200:300, margin:'0 auto 20px' }}><Divider/></div>
      <p style={{ color:W60, fontSize:isMobile?14:18, lineHeight:1.8, maxWidth:520, marginBottom:6 }}>
        Notre équipe va vous accueillir et vous attribuer un thérapeute.<br/>Merci de vous présenter à la réception.
      </p>
      <p style={{ fontFamily:'"Playfair Display",serif', color:GOLD_L, fontSize:isMobile?14:18, fontStyle:'italic', marginBottom:isMobile?20:36 }}>Merci de votre confiance.</p>

      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:2, padding:`${isMobile?16:24}px ${isMobile?16:40}px`, maxWidth:480, width:'100%', marginBottom:isMobile?20:36, textAlign:'left' }}>
        <div style={{ color:GOLD, fontSize:10, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Votre réservation</div>
        <div style={{ color:W, fontSize:isMobile?13:15, marginBottom:12 }}>
          📍 Mermoz · {todayLabel()}
        </div>
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
