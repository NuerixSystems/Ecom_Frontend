import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Enquiries from './pages/Enquiries.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Account from './pages/Account.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import BackButton from './components/BackButton.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import LoginDisabledRedirect from './components/LoginDisabledRedirect.jsx'
import { LOGIN_ENABLED } from './config/features.js'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cracker-cream">
      <ScrollToTop />
      <Header />
      <BackButton />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Navigate to="/contact" replace />} />
          <Route path="/enquiries" element={<Enquiries />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Auth pages: always available */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Account area: switched off unless VITE_LOGIN_ENABLED=true (src/config/features.js) */}
          <Route path="/account" element={LOGIN_ENABLED ? <Account /> : <LoginDisabledRedirect />} />
          <Route path="/orders" element={LOGIN_ENABLED ? <Orders /> : <LoginDisabledRedirect />} />
          <Route path="/orders/:id" element={LOGIN_ENABLED ? <OrderDetail /> : <LoginDisabledRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
