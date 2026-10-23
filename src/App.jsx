import { useState, useEffect } from "react";
import Watch3D from "./components/Watch3D";
import AnalogWatch3D from "./components/AnalogWatch3D";
import AdminPanel from "./components/AdminPanel";
import AuthScreen from "./components/AuthScreen";
import "./App.css";

const API_URL = "http://localhost:5000/api/auth";
const WATCHES_API_URL = "http://localhost:5000/api/watches";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWatchSelection, setShowWatchSelection] =
    useState(false);
  const [selectedWatch, setSelectedWatch] = useState(null);
  const [purchaseConfirmed, setPurchaseConfirmed] =
    useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(false);

  const [watches, setWatches] = useState([]);
  const [watchesLoading, setWatchesLoading] = useState(true);

  /* =========================
     CHECK EXISTING SESSION
  ========================= */

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${API_URL}/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();

        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Session check failed:",
          error
        );

        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkSession();
  }, []);

  /* =========================
     LOAD WATCHES FROM MONGODB
  ========================= */

  useEffect(() => {
    if (!isAuthenticated) {
      setWatches([]);
      setWatchesLoading(false);
      return;
    }

    const loadWatches = async () => {
      setWatchesLoading(true);

      try {
        const response = await fetch(
          WATCHES_API_URL,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load watches."
          );
        }

        const data = await response.json();

        setWatches(
          Array.isArray(data.watches)
            ? data.watches
            : []
        );
      } catch (error) {
        console.error(
          "Watch loading failed:",
          error
        );

        setWatches([]);
      } finally {
        setWatchesLoading(false);
      }
    };

    loadWatches();
  }, [isAuthenticated]);

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = async () => {
    setShowAccountMenu(false);

    try {
      await fetch(
        `${API_URL}/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);

      setWatches([]);
      setWatchesLoading(false);

      setShowAdmin(false);
      setShowBuyModal(false);
      setShowWatchSelection(false);
      setSelectedWatch(null);
      setPurchaseConfirmed(false);
    }
  };

  /* =========================
     ADMIN PANEL
  ========================= */

  const openAdminPanel = async () => {
    setShowAccountMenu(false);

    if (currentUser?.role !== "admin") {
      return;
    }

    setAdminChecking(true);

    try {
      const response = await fetch(
        `${API_URL}/admin/check`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }

        if (response.status === 403) {
          console.error(
            "Admin access denied."
          );
        }

        return;
      }

      const data = await response.json();

      if (
        data.admin &&
        data.admin.role === "admin"
      ) {
        setShowAdmin(true);
      }
    } catch (error) {
      console.error(
        "Admin verification failed:",
        error
      );
    } finally {
      setAdminChecking(false);
    }
  };

  /* =========================
     CLOSE ACCOUNT MENU
  ========================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(
          ".account-menu-wrapper"
        )
      ) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================
     BUY FLOW
  ========================= */

  const openWatchSelection = () => {
    setShowAccountMenu(false);
    setShowWatchSelection(true);
  };

  const closeWatchSelection = () => {
    setShowWatchSelection(false);
    setSelectedWatch(null);
  };

  const continueToPurchase = () => {
    if (!selectedWatch) return;

    setShowWatchSelection(false);
    setPurchaseConfirmed(false);
    setShowBuyModal(true);
  };

  const openDirectPurchase = () => {
    if (watches.length === 0) return;

    setSelectedWatch(watches[0]);
    setPurchaseConfirmed(false);
    setShowBuyModal(true);
  };

  const closeBuyModal = () => {
    setShowBuyModal(false);
    setPurchaseConfirmed(false);
  };

  const confirmPurchase = () => {
    setPurchaseConfirmed(true);
  };

  /* =========================
     AUTH CHECK LOADING
  ========================= */

  if (authChecking) {
    return (
      <main className="auth-screen">
        <div className="auth-card">

          <div className="auth-brand">

            <div className="auth-logo">
              PM
            </div>

            <div className="auth-brand-name">
              <strong>
                Watches
              </strong>
            </div>

          </div>

          <div className="auth-heading">

            <p className="eyebrow">
              PM WATCHES
            </p>

            <h1>
              Checking
              <br />
              your session.
            </h1>

            <p>
              Please wait a moment.
            </p>

          </div>

        </div>
      </main>
    );
  }

  /* =========================
     LOGIN SCREEN
  ========================= */

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={handleLogin}
      />
    );
  }

  /* =========================
     USER INFO
  ========================= */

  const userName =
    currentUser?.name?.trim() ||
    "Account";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const isAdmin =
    currentUser?.role === "admin";

  /* =========================
     MAIN WEBSITE
  ========================= */

  return (
    <>
      <main className="app">

        {/* =========================
            NAVBAR
        ========================= */}

        <nav className="navbar">

          <div className="logo">
            PM Watches
          </div>

          <div className="nav-links">

            <a href="#watch">
              Watch
            </a>

            <a href="#features">
              Features
            </a>

            <a href="#specs">
              Specs
            </a>

          </div>

          <div className="navbar-actions">

            {/* =========================
                BUY NOW
            ========================= */}

            <button
              className="nav-button"
              onClick={
                openWatchSelection
              }
            >
              Buy Now
            </button>

            {/* =========================
                ACCOUNT
            ========================= */}

            <div className="account-menu-wrapper">

              <button
                type="button"
                className={`account-trigger ${
                  showAccountMenu
                    ? "active"
                    : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();

                  setShowAccountMenu(
                    (current) => !current
                  );
                }}
                aria-expanded={
                  showAccountMenu
                }
              >

                <span className="account-avatar">
                  {userInitial}
                </span>

                <span className="account-name">
                  {userName}
                </span>

                <span
                  className={`account-chevron ${
                    showAccountMenu
                      ? "open"
                      : ""
                  }`}
                >
                  ↓
                </span>

              </button>

              {/* ACCOUNT DROPDOWN */}

              {showAccountMenu && (

                <div className="account-dropdown">

                  <div className="account-dropdown-header">

                    <div className="account-dropdown-avatar">
                      {userInitial}
                    </div>

                    <div className="account-dropdown-user">

                      <strong>
                        {userName}
                      </strong>

                      <span>
                        {currentUser?.email}
                      </span>

                    </div>

                  </div>

                  <div className="account-dropdown-divider" />

                  {/* =========================
                      ADMIN PANEL
                  ========================= */}

                  {isAdmin && (

                    <button
                      type="button"
                      className="account-dropdown-item"
                      onClick={
                        openAdminPanel
                      }
                      disabled={
                        adminChecking
                      }
                    >

                      <span className="account-item-icon">
                        ◈
                      </span>

                      <span>
                        {adminChecking
                          ? "Checking..."
                          : "Admin Panel"}
                      </span>

                    </button>

                  )}

                  {isAdmin && (
                    <div className="account-dropdown-divider" />
                  )}

                  {/* =========================
                      LOGOUT
                  ========================= */}

                  <button
                    type="button"
                    className="account-dropdown-item logout-item"
                    onClick={
                      handleLogout
                    }
                  >

                    <span className="account-item-icon">
                      ↪
                    </span>

                    <span>
                      Logout
                    </span>

                  </button>

                </div>

              )}

            </div>

          </div>

        </nav>

        {/* =========================
            HERO
        ========================= */}

        <section
          className="hero"
          id="watch"
        >

          <div className="hero-content">

            <p className="eyebrow">
              THE FUTURE OF TIME
            </p>

            <h1>
              Time,
              <br />
              reimagined.
            </h1>

            <p className="hero-text">
              Meet the new PM Watch —
              intelligent, elegant, and
              designed for every moment.
            </p>

            <a
              href="#features"
              className="hero-button"
            >
              Explore PM Watch
            </a>

          </div>

          <div className="hero-watch">
            <Watch3D
              enableRotate={false}
            />
          </div>

        </section>

        {/* =========================
            FEATURES
        ========================= */}

        <section
          className="features"
          id="features"
        >

          <div className="section-heading">

            <p className="eyebrow">
              BUILT FOR MORE
            </p>

            <h2>
              Everything you need.
            </h2>

          </div>

          <div className="feature-grid">

            <div className="feature-card">

              <span>
                01
              </span>

              <h3>
                Health Tracking
              </h3>

              <p>
                Track your daily activity,
                heart rate, sleep and more.
              </p>

            </div>

            <div className="feature-card">

              <span>
                02
              </span>

              <h3>
                Smart Notifications
              </h3>

              <p>
                Stay connected without
                constantly checking your phone.
              </p>

            </div>

            <div className="feature-card">

              <span>
                03
              </span>

              <h3>
                All-Day Battery
              </h3>

              <p>
                Designed to keep up with
                your day from morning to night.
              </p>

            </div>

          </div>

        </section>

        {/* =========================
            SHOWCASE
        ========================= */}

        <section
          className="showcase"
          id="specs"
        >

          <div className="showcase-content">

            <p className="eyebrow">
              MEET PM WATCH
            </p>

            <h2>
              Designed to
              <br />
              feel timeless.
            </h2>

            <p>
              A powerful smartwatch wrapped
              in a refined, minimal design.
              Built for your everyday life.
            </p>

            <a
              href="#specs"
              className="hero-button"
            >
              Explore the Watch
            </a>

          </div>

          <div className="showcase-watch">
            <Watch3D />
          </div>

        </section>

        {/* =========================
            BUY SECTION
        ========================= */}

        <section
          className="buy-section"
          id="buy"
        >

          <div className="buy-content">

            <p className="eyebrow">
              PM WATCH
            </p>

            <h2>
              Your time.
              <br />
              Your way.
            </h2>

            <p className="buy-description">
              A premium smartwatch designed
              for everyday life. Powerful
              features, elegant design, and
              everything you need at a glance.
            </p>

            <div className="buy-details">

              <div>

                <span>
                  Starting at
                </span>

                <strong>
                  {watchesLoading
                    ? "..."
                    : watches.length > 0
                    ? watches[0].price
                    : "23,999"}
                </strong>

              </div>

              <div>

                <span>
                  Battery
                </span>

                <strong>
                  7 Days
                </strong>

              </div>

              <div>

                <span>
                  Material
                </span>

                <strong>
                  Aluminium
                </strong>

              </div>

            </div>

            <button
              className="buy-main-button"
              onClick={
                openDirectPurchase
              }
              disabled={
                watchesLoading ||
                watches.length === 0
              }
            >
              {watchesLoading
                ? "Loading..."
                : "Buy PM Watch"}
            </button>

          </div>

          <div className="buy-visual">
            <AnalogWatch3D />
          </div>

        </section>

        {/* =========================
            WATCH SELECTION MODAL
        ========================= */}

        {showWatchSelection && (

          <div
            className="buy-modal-overlay"
            onClick={
              closeWatchSelection
            }
          >

            <div
              className="watch-selection-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                className="buy-modal-close"
                onClick={
                  closeWatchSelection
                }
              >
                ×
              </button>

              {watchesLoading ? (

                <>
                  <p className="buy-modal-label">
                    PM WATCH COLLECTION
                  </p>

                  <h2>
                    Loading watches.
                  </h2>

                  <p className="buy-modal-description">
                    Please wait a moment.
                  </p>
                </>

              ) : watches.length > 0 ? (

                <>
                  <p className="buy-modal-label">
                    PM WATCH COLLECTION
                  </p>

                  <h2>
                    Choose your watch.
                  </h2>

                  <p className="buy-modal-description">
                    Select the PM Watch that
                    fits your style.
                  </p>
                </>

              ) : (

                <>
                  <p className="buy-modal-label">
                    PM WATCH COLLECTION
                  </p>

                  <h2>
                    No watches available.
                  </h2>

                  <p className="buy-modal-description">
                    The collection is currently
                    empty.
                  </p>
                </>

              )}

              <div className="watch-options">

                {watchesLoading ? (

                  <div className="watch-options-empty">

                    <h3>
                      Loading...
                    </h3>

                  </div>

                ) : watches.length === 0 ? (

                  <div className="watch-options-empty">

                    <h3>
                      No watches are currently
                      available.
                    </h3>

                  </div>

                ) : (

                  watches.map((watch) => (

                    <button
                      key={watch._id || watch.id}
                      className={`watch-option ${
                        selectedWatch?._id ===
                          watch._id ||
                        selectedWatch?.id ===
                          watch.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedWatch(
                          watch
                        )
                      }
                    >

                      <div className="watch-option-visual">

                        {watch.image ? (

                          <div className="watch-option-image">

                            <img
                              src={watch.image}
                              alt={watch.name}
                            />

                          </div>

                        ) : (

                          <div className="mini-watch">

                            <div className="mini-watch-screen">
                              10:09
                            </div>

                          </div>

                        )}

                      </div>

                      <div className="watch-option-info">

                        <strong>
                          {watch.name}
                        </strong>

                        <span>
                          {watch.color}
                        </span>

                        <b>
                          {watch.price}
                        </b>

                      </div>

                    </button>

                  ))

                )}

              </div>

              {!watchesLoading &&
                watches.length > 0 && (

                  <button
                    className="buy-confirm-button"
                    disabled={
                      !selectedWatch
                    }
                    onClick={
                      continueToPurchase
                    }
                  >
                    Continue
                  </button>

                )}

            </div>

          </div>

        )}

        {/* =========================
            PURCHASE MODAL
        ========================= */}

        {showBuyModal && (

          <div
            className="buy-modal-overlay"
            onClick={closeBuyModal}
          >

            <div
              className="buy-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                className="buy-modal-close"
                onClick={closeBuyModal}
              >
                ×
              </button>

              {!purchaseConfirmed ? (

                <>

                  <p className="buy-modal-label">
                    PM WATCH
                  </p>

                  <h2>
                    Ready to make it yours?
                  </h2>

                  <p className="buy-modal-description">
                    You selected{" "}
                    <strong>
                      {selectedWatch?.name}
                    </strong>{" "}
                    in{" "}
                    {selectedWatch?.color}.
                  </p>

                  <div className="buy-modal-product">

                    <span>
                      {selectedWatch?.name}
                    </span>

                    <strong>
                      {selectedWatch?.price}
                    </strong>

                  </div>

                  <div className="buy-modal-info">

                    <div>

                      <span>
                        Battery
                      </span>

                      <strong>
                        7 Days
                      </strong>

                    </div>

                    <div>

                      <span>
                        Material
                      </span>

                      <strong>
                        Aluminium
                      </strong>

                    </div>

                  </div>

                  <button
                    className="buy-confirm-button"
                    onClick={
                      confirmPurchase
                    }
                  >
                    Confirm Purchase
                  </button>

                </>

              ) : (

                <div className="purchase-success">

                  <div className="success-icon">
                    ✓
                  </div>

                  <p className="buy-modal-label">
                    PM WATCH
                  </p>

                  <h2>
                    Order Confirmed.
                  </h2>

                  <p className="buy-modal-description">
                    Your{" "}
                    {selectedWatch?.name}{" "}
                    in{" "}
                    {selectedWatch?.color}{" "}
                    is ready.
                  </p>

                  <button
                    className="buy-confirm-button"
                    onClick={
                      closeBuyModal
                    }
                  >
                    Done
                  </button>

                </div>

              )}

            </div>

          </div>

        )}

      </main>

      {/* =========================
          ADMIN PANEL
      ========================= */}

      {showAdmin && isAdmin && (

        <AdminPanel
          watches={watches}
          setWatches={setWatches}
          onClose={() =>
            setShowAdmin(false)
          }
        />

      )}

    </>
  );
}

export default App;