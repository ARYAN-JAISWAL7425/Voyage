import {
  Compass, Store, Search, Filter, SlidersHorizontal, ArrowRight, ArrowLeft,
  ChevronRight, ChevronDown, ChevronLeft, ChevronUp, X, Menu, Plus, Minus, Check,
  CircleCheck, CircleX, CircleAlert, Info, ExternalLink, MoreHorizontal, MoreVertical,
  Settings, LogOut, Bell, MessageCircle, Send, Heart, Bookmark, Share2, Eye, EyeOff,
  Pencil, Trash2, Copy, Download, Upload, Image as ImageIcon, Camera, Star,
  MapPin, Calendar, CalendarDays, CalendarCheck, Users, User, Wallet, Luggage,
  BadgeCheck, ShieldCheck, Globe, Plane, PlaneTakeoff, TrainFront, Bus, Car, Ship,
  Mountain, Waves, Landmark, Trees, Building2, Building, Tent, Hotel, BedDouble,
  Utensils, Coffee, Wifi, Snowflake, Sun, Umbrella, Ticket, QrCode, Armchair,
  Timer, Clock, Route, Navigation, Flag, Sparkles, Award, Trophy, Gift, Percent,
  Tag, Flame, Gamepad2, Music, PartyPopper, Binoculars, LayoutDashboard,
  TrendingUp, TrendingDown, DollarSign, IndianRupee, BarChart3, PieChart,
  CreditCard, Banknote, Receipt, FileText, ClipboardList, Package, Briefcase,
  Headphones, LifeBuoy, Phone, Mail, Lock, Smartphone, CircleHelp, Verified,
  Quote, ThumbsUp, MapPinned, Map as MapIcon, Megaphone, Inbox, FileCheck,
  CheckCheck, Circle, Save, Paperclip, SlidersVertical, Grid3x3,
  type LucideIcon, type LucideProps,
} from 'lucide-react'

/** Maps the Pencil design's kebab-case icon names to lucide-react components. */
const registry = {
  compass: Compass, store: Store, search: Search, filter: Filter,
  'sliders-horizontal': SlidersHorizontal, 'arrow-right': ArrowRight, 'arrow-left': ArrowLeft,
  'chevron-right': ChevronRight, 'chevron-down': ChevronDown, 'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp, x: X, menu: Menu, plus: Plus, minus: Minus, check: Check,
  'circle-check': CircleCheck, 'circle-x': CircleX, 'circle-alert': CircleAlert, info: Info,
  'external-link': ExternalLink, 'more-horizontal': MoreHorizontal, 'more-vertical': MoreVertical,
  settings: Settings, 'log-out': LogOut, bell: Bell, 'message-circle': MessageCircle, send: Send,
  heart: Heart, bookmark: Bookmark, 'share-2': Share2, eye: Eye, 'eye-off': EyeOff,
  pencil: Pencil, 'trash-2': Trash2, copy: Copy, download: Download, upload: Upload,
  image: ImageIcon, camera: Camera, star: Star, 'map-pin': MapPin, calendar: Calendar,
  'calendar-days': CalendarDays, 'calendar-check': CalendarCheck, users: Users, user: User,
  wallet: Wallet, luggage: Luggage, 'badge-check': BadgeCheck, 'shield-check': ShieldCheck,
  globe: Globe, plane: Plane, 'plane-takeoff': PlaneTakeoff, 'train-front': TrainFront,
  bus: Bus, car: Car, ship: Ship, mountain: Mountain, waves: Waves, landmark: Landmark,
  trees: Trees, 'building-2': Building2, building: Building, tent: Tent, hotel: Hotel,
  bed: BedDouble, utensils: Utensils, coffee: Coffee, wifi: Wifi, snowflake: Snowflake,
  sun: Sun, umbrella: Umbrella, ticket: Ticket, 'qr-code': QrCode, armchair: Armchair,
  timer: Timer, clock: Clock, route: Route, navigation: Navigation, flag: Flag,
  sparkles: Sparkles, award: Award, trophy: Trophy, gift: Gift, percent: Percent, tag: Tag,
  flame: Flame, 'gamepad-2': Gamepad2, music: Music, 'party-popper': PartyPopper,
  binoculars: Binoculars, 'layout-dashboard': LayoutDashboard, 'trending-up': TrendingUp,
  'trending-down': TrendingDown, 'dollar-sign': DollarSign, 'indian-rupee': IndianRupee,
  'bar-chart-3': BarChart3, 'pie-chart': PieChart, 'credit-card': CreditCard,
  banknote: Banknote, receipt: Receipt, 'file-text': FileText, 'clipboard-list': ClipboardList,
  package: Package, briefcase: Briefcase, headphones: Headphones, 'life-buoy': LifeBuoy,
  phone: Phone, mail: Mail, lock: Lock, smartphone: Smartphone,
  'circle-help': CircleHelp, verified: Verified, quote: Quote, 'thumbs-up': ThumbsUp,
  'map-pinned': MapPinned, map: MapIcon, megaphone: Megaphone, inbox: Inbox,
  'file-check': FileCheck, 'check-check': CheckCheck, circle: Circle, save: Save,
  paperclip: Paperclip, 'sliders-vertical': SlidersVertical, 'grid-3x3': Grid3x3,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof registry

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName
  size?: number
}

/** Renders a lucide icon by its design name. Size is in px (sets width & height). */
export function Icon({ name, size = 18, strokeWidth = 2, ...rest }: IconProps) {
  const Cmp = registry[name]
  return <Cmp size={size} strokeWidth={strokeWidth} {...rest} />
}
