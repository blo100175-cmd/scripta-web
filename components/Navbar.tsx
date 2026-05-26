//SCRIPTA V2.250526 - PURE CENTRALIZED AUTH NAVBAR
"use client";

import Link from "next/link";                               
import { useAuth } from "@/components/AuthProvider";

export default function Navbar() {

  const {
    user,                                   
    effectiveTier,
    logout,
    loading,                
  } = useAuth();

/*const [health, setHealth] =
    useState<string>("🟢");

  /* =========================================
     USAGE HEALTH
  ========================================= */

/*useEffect(() => {

    if (!usage || !usage.page_limit) {

      setHealth("🟢");
      return;
    }

    const ratio =
      usage.total_pages / usage.page_limit;

    if (ratio >= 1) {
      setHealth("🔴");
    }
    else if (ratio >= 0.8) {
      setHealth("🟡");
    }
    else {
      setHealth("🟢");
    }

  }, [usage]);*/

  /* =========================================
     PREVENT HYDRATION FLICKER
  ========================================= */

  if (loading) {

    return (
      <nav className="navbar">

        <div className="nav-left">
          <Link href="/" className="logo">
            <img src="/logo.png" alt="Scripta Logo" />
          </Link>
        </div>

      </nav>
    );
  }

  return (

    <nav className="navbar">

      {/* LEFT */}

      <div className="nav-left">

        <Link href="/" className="logo">
          <img src="/logo.png" alt="Scripta Logo" />
        </Link>

      </div>

      {/* RIGHT */}

      <div className="nav-right">

        {user ? (

          <>

            <span className="account-indicator">
              {user.email} . {effectiveTier}
            </span>

            <a href="/affiliate">affiliate</a>
            <Link href="/app">app</Link>
            <a href="/#features">features</a>
            <a href="/#why-us">why scripta</a>
            <Link href="/pricing">pricing</Link>
            <a href="/#contact">contact</a>

            <button onClick={logout}>
              logout
            </button>

          </>

        ) : (

          <>

            <Link href="/login">login</Link>
            <a href="/affiliate">affiliate</a>
            <Link href="/app">app</Link>
            <a href="/#features">features</a>
            <a href="/#why-us">why scripta</a>
            <Link href="/pricing">pricing</Link>
            <a href="/#contact">contact</a>

          </>

        )}

      </div>

    </nav>

  );
}