import { Routes, Route } from 'react-router-dom'
import { SiteLayout } from '@/components/layout/SiteLayout'
import Home from '@/pages/Home'
import Search from '@/pages/Search'
import HowItWorks from '@/pages/HowItWorks'
import Destinations from '@/pages/Destinations'
import Deals from '@/pages/Deals'
import TripDetail from '@/pages/TripDetail'
import Auth from '@/pages/Auth'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import RoleSelect from '@/pages/RoleSelect'
import Checkout from '@/pages/Checkout'
import BookingVoucher from '@/pages/BookingVoucher'
import TravelerDashboard from '@/pages/TravelerDashboard'
import BusinessDashboard from '@/pages/BusinessDashboard'
import BusinessRegister from '@/pages/BusinessRegister'
import CreateTrip from '@/pages/CreateTrip'
import Messages from '@/pages/Messages'
import Notifications from '@/pages/Notifications'
import SavedTrips from '@/pages/SavedTrips'
import MyBookings from '@/pages/MyBookings'
import MyReviews from '@/pages/MyReviews'
import PaymentMethods from '@/pages/PaymentMethods'
import TravelerSettings from '@/pages/TravelerSettings'
import BusinessTrips from '@/pages/BusinessTrips'
import BusinessBookings from '@/pages/BusinessBookings'
import BusinessAvailability from '@/pages/BusinessAvailability'
import BusinessReviews from '@/pages/BusinessReviews'
import BusinessEarnings from '@/pages/BusinessEarnings'
import BusinessPromote from '@/pages/BusinessPromote'
import BusinessSettings from '@/pages/BusinessSettings'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/trip/:id" element={<TripDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Standalone (own chrome) */}
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/get-started" element={<RoleSelect />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/voucher" element={<BookingVoucher />} />
      <Route path="/dashboard" element={<TravelerDashboard />} />
      <Route path="/dashboard/bookings" element={<MyBookings />} />
      <Route path="/dashboard/reviews" element={<MyReviews />} />
      <Route path="/dashboard/payment-methods" element={<PaymentMethods />} />
      <Route path="/dashboard/settings" element={<TravelerSettings />} />
      <Route path="/business/dashboard" element={<BusinessDashboard />} />
      <Route path="/business/register" element={<BusinessRegister />} />
      <Route path="/business/trips" element={<BusinessTrips />} />
      <Route path="/business/trips/new" element={<CreateTrip />} />
      <Route path="/business/bookings" element={<BusinessBookings />} />
      <Route path="/business/availability" element={<BusinessAvailability />} />
      <Route path="/business/reviews" element={<BusinessReviews />} />
      <Route path="/business/earnings" element={<BusinessEarnings />} />
      <Route path="/business/promote" element={<BusinessPromote />} />
      <Route path="/business/settings" element={<BusinessSettings />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/saved" element={<SavedTrips />} />
    </Routes>
  )
}
