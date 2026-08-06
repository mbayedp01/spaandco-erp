'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  ShoppingBag, Plus, Minus, X, ChevronRight, Clock,
  CheckCircle, Phone, User, ArrowLeft, MapPin, Calendar,
} from 'lucide-react'
import { submitKiosqueOrder, type KiosqueItem } from '@/app/actions/kiosque'

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD      = '#C9A84C'
const GOLD_L    = '#E8CC7A'
const GOLD_D    = '#A88430'
const BG        = '#0C0A07'
const CARD      = '#1A1510'
const CARD2     = '#231D14'
const BORDER    = 'rgba(201,168,76,0.2)'
const BORDER_A  = 'rgba(201,168,76,0.65)'
const W         = '#FFFFFF'
const W60       = 'rgba(255,255,255,0.65)'
const W30       = 'rgba(255,255,255,0.3)'

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
  'Massages':     { label: 'Massages & Modelages',  desc: 'Détente et relaxation' },
  'Soins visage': { label: 'Soins du Visage',        desc: 'Éclat & rajeunissement' },
  'Soins corps':  { label: 'Hammam & Corps',         desc: 'Gommage, hammam' },
  'Beauté':       { label: 'Beauté & Onglerie',      desc: 'Cils, ongles, nail art' },
  'Coiffure':     { label: 'Coiffure',               desc: 'Brushing, couleur' },
  'Formules':     { label: 'Offres & Forfaits',      desc: 'Packages exclusifs' },
  'Épilations':   { label: 'Épilations',             desc: 'Cire et laser' },
}

const DAYS_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const MONTHS_FR = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (p: number) => p.toLocaleString('fr-FR') + ' F'
const dur = (m: number) => m < 60 ? `${m} min` : `${Math.floor(m/60)}h${m%60 ? String(m%60).padStart(2,'0') : ''}`
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

function Header({ onBack, showBack=false }: { onBack?: () => void; showBack?: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
      {showBack
        ? <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${BORDER}`, color:W60, cursor:'pointer', padding:'8px 16px', borderRadius:2, fontSize:14 }}>
            <ArrowLeft size={15}/> Retour
          </button>
        : <div style={{ width:90 }} />}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <Lotus size={26}/>
        <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:18, letterSpacing:2 }}>
          SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
        </span>
      </div>
      <div style={{ width:90 }} />
    </div>
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

  const cats        = [...new Set(services.map(s => s.category).filter(Boolean))] as string[]
  const curCat      = activeCat ?? cats[0] ?? null
  const cartTotal   = cart.reduce((s, i) => s + (i.service.price??0)*i.qty, 0)
  const cartCount   = cart.reduce((s, i) => s + i.qty, 0)
  const cartDurMin  = cart.reduce((s, i) => s + (i.service.duration??60)*i.qty, 0)
  const spaStaff    = staffList.filter(m => m.spa_id === spa?.id)

  // Inactivity 60s → welcome
  useEffect(() => {
    if (screen === 'success') return
    let t: ReturnType<typeof setTimeout>
    const reset = () => {
      clearTimeout(t)
      t = setTimeout(() => resetAll(), 60_000)
    }
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

  // Availability: slots taken by a therapist on a date
  function takenSlots(member: StaffMember, d: string): Set<string> {
    const taken = new Set<string>()
    const name = `${member.first_name} ${member.last_name}`
    appointments
      .filter(a => a.date === d && a.staff_name === name && ['confirmed','pending'].includes(a.status))
      .forEach(a => {
        if (!a.time) return
        const start = timeToMin(a.time)
        const end   = start + (a.duration ?? 60)
        WORK_SLOTS.forEach(s => {
          const sm = timeToMin(s)
          if (sm >= start && sm < end) taken.add(s)
        })
      })
    return taken
  }

  // Is slot available: slot + cart duration must be free
  function isSlotFree(member: StaffMember, d: string, s: string): boolean {
    const taken = takenSlots(member, d)
    const start  = timeToMin(s)
    const end    = start + cartDurMin
    return WORK_SLOTS.filter(sl => {
      const m = timeToMin(sl)
      return m >= start && m < end
    }).every(sl => !taken.has(sl))
  }

  function goToCatalogue() {
    setActiveCat(cats[0] ?? null)
    setScreen('catalogue')
  }

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
        spa_id:      spa?.id ?? '',
        client_name: name,
        client_phone: phone,
        items,
        total:       cartTotal,
        date,
        time:        slot ?? '09:00',
        staff_name:  staff ? `${staff.first_name} ${staff.last_name}` : 'À définir',
        staff_id:    staff?.id ?? '',
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

      <div style={{ position:'relative', zIndex:10, textAlign:'center', maxWidth:920, padding:'0 40px' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}><Lotus size={90}/></div>
        <div style={{ fontFamily:'"Playfair Display",serif', fontSize:88, fontWeight:600, color:W, letterSpacing:5, lineHeight:1 }}>SPA & CO</div>
        <div style={{ fontFamily:'"Playfair Display",serif', color:GOLD, fontSize:24, letterSpacing:14, margin:'8px 0 40px' }}>— LUXURY —</div>
        <Divider/>
        <div style={{ margin:'44px 0' }}>
          <p style={{ fontFamily:'"Playfair Display",serif', fontSize:38, color:W, marginBottom:14, fontWeight:400 }}>Bienvenue chez SPA & CO Luxury</p>
          <p style={{ fontFamily:'"Playfair Display",serif', fontSize:24, color:GOLD_L, fontStyle:'italic', marginBottom:16 }}>Prenez soin de vous, vous le méritez.</p>
          <p style={{ fontSize:18, color:W60, lineHeight:1.8, maxWidth:620, margin:'0 auto' }}>Découvrez nos prestations et composez votre expérience<br/>bien-être en quelques instants.</p>
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:14, padding:'24px 68px', background:`linear-gradient(135deg,${GOLD},${GOLD_D})`, borderRadius:3, color:BG, fontSize:24, fontWeight:700, letterSpacing:2, boxShadow:`0 0 50px rgba(201,168,76,.35)` }}>
          ✨ Commencer
        </div>
        <p style={{ marginTop:26, color:W30, fontSize:16, letterSpacing:2 }}>Touchez l&apos;écran pour commencer</p>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════
  // CHOIX DU SPA
  // ════════════════════════════════════════════════════════════════════════
  if (screen === 'spa') return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <Header/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40 }}>
        <p style={{ color:GOLD, fontSize:12, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>Étape 1 / 4</p>
        <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:52, color:W, marginBottom:8, textAlign:'center' }}>Choisissez votre spa</h1>
        <div style={{ width:400, margin:'0 auto 48px' }}><Divider/></div>
        <div style={{ display:'flex', gap:32, justifyContent:'center', flexWrap:'wrap' }}>
          {establishments.map(est => (
            <button key={est.id} onClick={() => { setSpa(est); goToCatalogue() }}
              style={{
                width:360, padding:'48px 40px',
                background: CARD, border:`2px solid ${BORDER}`,
                borderRadius:4, cursor:'pointer', textAlign:'center',
                transition:'border-color .2s, transform .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER_A; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
            >
              <Lotus size={56}/>
              <div style={{ fontFamily:'"Playfair Display",serif', fontSize:40, color:W, marginTop:20, marginBottom:6 }}>{est.name}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:GOLD, fontSize:16 }}>
                <MapPin size={14}/> {est.city}
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
    return (
      <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 32px', borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <button onClick={() => setScreen('spa')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:`1px solid ${BORDER}`, color:W60, cursor:'pointer', padding:'8px 16px', borderRadius:2, fontSize:13 }}>
            <ArrowLeft size={14}/> Changer de spa
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Lotus size={26}/>
            <span style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:18, letterSpacing:2 }}>
              SPA & CO <span style={{ color:GOLD }}>LUXURY</span>
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ color:GOLD, fontSize:13, fontFamily:'"Playfair Display",serif', fontStyle:'italic' }}>{spa?.name}</span>
            <div style={{ position:'relative', color:GOLD }}>
              <ShoppingBag size={26}/>
              {cartCount > 0 && <span style={{ position:'absolute', top:-8, right:-8, width:20, height:20, borderRadius:'50%', background:GOLD, color:BG, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          {/* Categories */}
          <div style={{ width:260, flexShrink:0, borderRight:`1px solid ${BORDER}`, overflowY:'auto', padding:'12px 0' }}>
            {cats.map(cat => {
              const cfg = CAT_CFG[cat] ?? { label:cat, desc:'' }
              const isA = cat === curCat
              return (
                <button key={cat} onClick={() => setActiveCat(cat)} style={{ width:'100%', textAlign:'left', padding:'15px 20px', background:isA?CARD:'transparent', borderLeft:`3px solid ${isA?GOLD:'transparent'}`, border:'none', cursor:'pointer' }}>
                  <div style={{ color:isA?GOLD:W, fontSize:14, fontWeight:500 }}>{cfg.label}</div>
                  <div style={{ color:W30, fontSize:11, marginTop:3 }}>{cfg.desc}</div>
                </button>
              )
            })}
          </div>

          {/* Services */}
          <div style={{ flex:1, overflowY:'auto', padding:'22px 26px' }}>
            {curCat && <h2 style={{ fontFamily:'"Playfair Display",serif', color:W, fontSize:28, marginBottom:8 }}>{CAT_CFG[curCat]?.label ?? curCat}</h2>}
            <Divider/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, marginTop:18 }}>
              {svcs.map(svc => {
                const inC = cart.find(i => i.service.id === svc.id)
                return (
                  <div key={svc.id} style={{ background:CARD, borderRadius:2, border:`1px solid ${inC?BORDER_A:BORDER}`, padding:'18px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ color:W, fontSize:15, fontWeight:500, lineHeight:1.3 }}>{svc.name}</div>
                    {svc.description && <div style={{ color:W60, fontSize:12, lineHeight:1.5 }}>{svc.description}</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:'auto' }}>
                      {svc.duration && <span style={{ display:'flex', alignItems:'center', gap:3, color:W30, fontSize:12 }}><Clock size={12}/>{dur(svc.duration)}</span>}
                      {svc.price != null && <span style={{ color:GOLD, fontSize:17, fontWeight:600, marginLeft:'auto' }}>{fmt(svc.price)}</span>}
                    </div>
                    {inC ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button onClick={() => setQty(svc.id, inC.qty-1)} style={{ width:34, height:34, borderRadius:2, border:`1px solid ${BORDER}`, background:CARD2, color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Minus size={13}/></button>
                        <span style={{ color:W, fontWeight:600, minWidth:18, textAlign:'center' }}>{inC.qty}</span>
                        <button onClick={() => setQty(svc.id, inC.qty+1)} style={{ width:34, height:34, borderRadius:2, border:`1px solid ${BORDER}`, background:CARD2, color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={13}/></button>
                        <span style={{ color:GOLD, fontSize:12, marginLeft:'auto' }}>✓ Ajouté</span>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(svc)} style={{ padding:'9px', background:'transparent', border:`1px solid ${GOLD_D}`, borderRadius:2, color:GOLD, fontSize:13, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                        <Plus size={14}/> Ajouter
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cart */}
          <div style={{ width:320, flexShrink:0, borderLeft:`1px solid ${BORDER}`, display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:8 }}>
              <ShoppingBag size={15} color={GOLD}/>
              <span style={{ color:W, fontSize:14, fontWeight:500 }}>Votre sélection</span>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'14px 20px' }}>
              {cart.length === 0 ? (
                <div style={{ color:W30, fontSize:13, textAlign:'center', marginTop:44, lineHeight:2 }}>
                  <ShoppingBag size={36} style={{ marginBottom:10, opacity:.2 }}/><br/>
                  Votre sélection est vide.<br/>Choisissez une prestation.
                </div>
              ) : cart.map(item => (
                <div key={item.service.id} style={{ borderBottom:`1px solid ${BORDER}`, paddingBottom:12, marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:W, fontSize:13, lineHeight:1.3 }}>{item.service.name}</div>
                      {item.service.duration && <div style={{ color:W30, fontSize:11, marginTop:2 }}>{dur(item.service.duration)}</div>}
                    </div>
                    <button onClick={() => setQty(item.service.id, 0)} style={{ background:'none', border:'none', color:W30, cursor:'pointer', padding:2 }}><X size={13}/></button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={() => setQty(item.service.id, item.qty-1)} style={{ width:26, height:26, borderRadius:2, border:`1px solid ${BORDER}`, background:'transparent', color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Minus size={11}/></button>
                      <span style={{ color:W, fontSize:13, minWidth:14, textAlign:'center' }}>{item.qty}</span>
                      <button onClick={() => setQty(item.service.id, item.qty+1)} style={{ width:26, height:26, borderRadius:2, border:`1px solid ${BORDER}`, background:'transparent', color:W, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={11}/></button>
                    </div>
                    <span style={{ color:GOLD, fontSize:14, fontWeight:600 }}>{fmt((item.service.price??0)*item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:'16px 20px', borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
              {cart.length > 0 && (
                <div style={{ fontSize:12, color:W30, marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
                  <Clock size={12}/> Durée totale : {dur(cartDurMin)}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ color:W60, fontSize:13 }}>Total</span>
                <span style={{ color:GOLD, fontSize:20, fontWeight:700 }}>{fmt(cartTotal)}</span>
              </div>
              <button onClick={() => cart.length > 0 && setScreen('disponibilite')} disabled={cart.length === 0}
                style={{ width:'100%', padding:'14px', background:cart.length>0?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:cart.length>0?BG:W30, fontSize:14, fontWeight:700, letterSpacing:1, cursor:cart.length>0?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                Choisir un créneau <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
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
        <Header showBack onBack={() => setScreen('catalogue')}/>

        <div style={{ flex:1, overflowY:'auto', padding:'32px 48px' }}>
          <p style={{ color:GOLD, fontSize:12, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>Étape 3 / 4</p>
          <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:44, color:W, marginBottom:8 }}>Choisissez votre créneau</h1>
          <Divider/>

          <div style={{ marginTop:36, display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:48 }}>

            {/* Left column: Date + Therapist */}
            <div>
              {/* Date selector */}
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:16 }}>
                <Calendar size={13} style={{ verticalAlign:'middle', marginRight:6 }}/>
                Choisissez une date
              </p>
              <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
                {days.map(d => {
                  const { day, num, month } = fmtDate(d)
                  const isA = d === date
                  return (
                    <button key={d} onClick={() => { setDate(d); setSlot(null) }}
                      style={{ flexShrink:0, width:80, padding:'14px 10px', background:isA?`linear-gradient(135deg,${GOLD},${GOLD_D})`:CARD, border:`1px solid ${isA?GOLD:BORDER}`, borderRadius:2, cursor:'pointer', textAlign:'center' }}>
                      <div style={{ color:isA?BG:W60, fontSize:11, textTransform:'uppercase', letterSpacing:1 }}>{day}</div>
                      <div style={{ color:isA?BG:W, fontSize:26, fontWeight:700, lineHeight:1.2 }}>{num}</div>
                      <div style={{ color:isA?BG:W60, fontSize:11, textTransform:'uppercase' }}>{month}</div>
                    </button>
                  )
                })}
              </div>

              {/* Therapist selector */}
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', margin:'32px 0 16px' }}>
                <User size={13} style={{ verticalAlign:'middle', marginRight:6 }}/>
                Choisissez votre thérapeute
              </p>
              {spaStaff.length === 0 ? (
                <p style={{ color:W30, fontSize:13 }}>Aucun thérapeute disponible pour ce spa.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {spaStaff.map(m => {
                    const taken  = takenSlots(m, date)
                    const free   = WORK_SLOTS.filter(s => !taken.has(s))
                    const isA    = staff?.id === m.id
                    return (
                      <button key={m.id} onClick={() => { setStaff(m); setSlot(null) }}
                        style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:isA?CARD2:CARD, border:`1px solid ${isA?BORDER_A:BORDER}`, borderRadius:2, cursor:'pointer', textAlign:'left' }}>
                        <div style={{ width:44, height:44, borderRadius:'50%', background:isA?GOLD:CARD2, border:`2px solid ${isA?GOLD:BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', color:isA?BG:W60, fontWeight:700, fontSize:15, flexShrink:0 }}>
                          {initials(m)}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ color:isA?GOLD:W, fontSize:15, fontWeight:500 }}>{m.first_name} {m.last_name}</div>
                          <div style={{ color:W30, fontSize:12, marginTop:2 }}>{m.specialty ?? '—'}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ color:isA?GOLD:W60, fontSize:13 }}>{free.length} créneaux</div>
                          <div style={{ color:W30, fontSize:11 }}>disponibles</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right column: Time slots */}
            <div>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:16 }}>
                <Clock size={13} style={{ verticalAlign:'middle', marginRight:6 }}/>
                Choisissez l&apos;heure de début
                {cartDurMin > 0 && <span style={{ color:W30, fontWeight:400, marginLeft:8, letterSpacing:0, textTransform:'none', fontSize:11 }}>· durée : {dur(cartDurMin)}</span>}
              </p>

              {!staff ? (
                <div style={{ color:W30, fontSize:14, padding:'32px 0' }}>← Sélectionnez d&apos;abord un thérapeute</div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {WORK_SLOTS.map(s => {
                    const isFree = isSlotFree(staff, date, s)
                    const isA    = s === slot
                    return (
                      <button key={s} onClick={() => isFree && setSlot(s)} disabled={!isFree}
                        style={{
                          padding:'12px 8px', borderRadius:2, border:`1px solid ${isA?GOLD:isFree?BORDER:'transparent'}`,
                          background: isA?`linear-gradient(135deg,${GOLD},${GOLD_D})` : isFree?CARD:'rgba(255,255,255,.03)',
                          color: isA?BG : isFree?W:W30,
                          cursor: isFree?'pointer':'not-allowed',
                          fontSize:14, fontWeight:isA?700:400,
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
                <div style={{ marginTop:24, padding:'16px 20px', background:CARD2, border:`1px solid ${BORDER_A}`, borderRadius:2 }}>
                  <p style={{ color:GOLD, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Récapitulatif du créneau</p>
                  <div style={{ color:W, fontSize:15 }}>{fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month} · {slot}</div>
                  <div style={{ color:W60, fontSize:13, marginTop:4 }}>{staff.first_name} {staff.last_name} · {dur(cartDurMin)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding:'18px 48px', borderTop:`1px solid ${BORDER}`, flexShrink:0, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={() => canContinue && setScreen('info')} disabled={!canContinue}
            style={{ padding:'16px 48px', background:canContinue?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:canContinue?BG:W30, fontSize:16, fontWeight:700, letterSpacing:1, cursor:canContinue?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:10 }}>
            Renseigner mes coordonnées <ChevronRight size={18}/>
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
        <Header showBack onBack={() => setScreen('disponibilite')}/>
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          <div style={{ flex:1, padding:'48px 64px', overflowY:'auto' }}>
            <div style={{ maxWidth:520 }}>
              <p style={{ color:GOLD, fontSize:11, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>Étape 4 / 4</p>
              <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:46, color:W, marginBottom:8 }}>Vos informations</h1>
              <Divider/>
              <p style={{ color:W60, fontSize:15, margin:'22px 0 36px', lineHeight:1.8 }}>
                Renseignez vos coordonnées pour que notre équipe puisse vous accueillir immédiatement.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
                <div>
                  <label style={{ display:'flex', alignItems:'center', gap:7, color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:10 }}>
                    <User size={12}/> Nom et prénom *
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet"
                    style={{ width:'100%', padding:'18px 22px', background:CARD, border:`1px solid ${name?BORDER_A:BORDER}`, borderRadius:2, color:W, fontSize:20, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ display:'flex', alignItems:'center', gap:7, color:GOLD, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', marginBottom:10 }}>
                    <Phone size={12}/> Téléphone *
                  </label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 000 00 00"
                    style={{ width:'100%', padding:'18px 22px', background:CARD, border:`1px solid ${phone?BORDER_A:BORDER}`, borderRadius:2, color:W, fontSize:20, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <button onClick={submit} disabled={!ok || isPending}
                  style={{ marginTop:8, padding:'20px', background:ok?`linear-gradient(135deg,${GOLD},${GOLD_D})`:'rgba(255,255,255,.05)', border:'none', borderRadius:2, color:ok?BG:W30, fontSize:18, fontWeight:700, letterSpacing:1.5, cursor:ok?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:isPending?.7:1 }}>
                  {isPending ? 'Envoi en cours…' : <><CheckCircle size={19}/> Valider ma réservation</>}
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ width:340, flexShrink:0, borderLeft:`1px solid ${BORDER}`, padding:'28px 24px', overflowY:'auto' }}>
            <p style={{ color:GOLD, fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:16 }}>Récapitulatif</p>

            {/* Créneau */}
            <div style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:2, padding:'14px 16px', marginBottom:20 }}>
              <div style={{ color:W60, fontSize:11, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Créneau</div>
              <div style={{ color:W, fontSize:14 }}>{spa?.name} · {fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month}</div>
              <div style={{ color:GOLD, fontSize:16, fontWeight:600, marginTop:4 }}>{slot}</div>
              {staff && <div style={{ color:W60, fontSize:13, marginTop:4 }}>{staff.first_name} {staff.last_name}</div>}
            </div>

            {/* Services */}
            {cart.map(item => (
              <div key={item.service.id} style={{ borderBottom:`1px solid ${BORDER}`, paddingBottom:12, marginBottom:12, display:'flex', justifyContent:'space-between', gap:8 }}>
                <div>
                  <div style={{ color:W, fontSize:13 }}>{item.service.name}</div>
                  {item.qty > 1 && <div style={{ color:W30, fontSize:11 }}>× {item.qty}</div>}
                </div>
                <div style={{ color:GOLD, fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>{fmt((item.service.price??0)*item.qty)}</div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:16, paddingTop:12, borderTop:`1px solid ${BORDER}` }}>
              <span style={{ color:W60 }}>Total</span>
              <span style={{ color:GOLD, fontSize:22, fontWeight:700 }}>{fmt(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  // SUCCESS
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ position:'fixed', inset:0, background:BG, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:40 }}>
      <div style={{ width:110, height:110, borderRadius:'50%', border:`2px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28, boxShadow:`0 0 60px rgba(201,168,76,.2)` }}>
        <CheckCircle size={52} color={GOLD} strokeWidth={1.5}/>
      </div>
      <Lotus size={34}/>
      <h1 style={{ fontFamily:'"Playfair Display",serif', fontSize:58, color:W, margin:'18px 0 8px' }}>Réservation confirmée !</h1>
      <div style={{ width:300, margin:'0 auto 28px' }}><Divider/></div>
      <p style={{ color:W60, fontSize:18, lineHeight:1.8, maxWidth:560, marginBottom:8 }}>
        Notre équipe vous accueillera dans quelques instants.<br/>Merci de vous présenter à la réception.
      </p>
      <p style={{ fontFamily:'"Playfair Display",serif', color:GOLD_L, fontSize:18, fontStyle:'italic', marginBottom:36 }}>Merci de votre confiance.</p>

      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:2, padding:'24px 40px', maxWidth:500, width:'100%', marginBottom:36, textAlign:'left' }}>
        <div style={{ color:GOLD, fontSize:10, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Votre réservation</div>
        <div style={{ color:W, fontSize:15, marginBottom:4 }}>
          📍 {spa?.name} · {fmtDate(date).day} {fmtDate(date).num} {fmtDate(date).month} à {slot}
        </div>
        {staff && <div style={{ color:W60, fontSize:13, marginBottom:14 }}>👤 {staff.first_name} {staff.last_name}</div>}
        {cart.map(item => (
          <div key={item.service.id} style={{ display:'flex', justifyContent:'space-between', color:W, fontSize:14, padding:'6px 0', borderBottom:`1px solid ${BORDER}` }}>
            <span>{item.service.name}{item.qty>1?` × ${item.qty}`:''}</span>
            <span style={{ color:GOLD }}>{fmt((item.service.price??0)*item.qty)}</span>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, color:W }}>
          <span>Total</span><span style={{ color:GOLD, fontWeight:700, fontSize:20 }}>{fmt(cartTotal)}</span>
        </div>
      </div>

      <p style={{ color:W30, fontSize:15 }}>Retour à l&apos;accueil dans <span style={{ color:GOLD }}>{countdown}</span>s</p>
      <button onClick={resetAll} style={{ marginTop:12, background:'none', border:`1px solid ${BORDER}`, color:W60, padding:'11px 28px', borderRadius:2, cursor:'pointer', fontSize:13, letterSpacing:1 }}>
        Nouvelle réservation
      </button>
    </div>
  )
}
