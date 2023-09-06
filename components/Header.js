import React, { useState, useEffect } from "react";
import Link from "next/link";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Image from "next/image";
import fetchJson from "lib/fetchJson";

export default function Header() {
  const { user, mutateUser } = useUser();
  const router = useRouter();

  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth <= 600);
    const handleWindowResize = () => setMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <header>
      <nav>
        <ul>
          {user?.isLoggedIn === false && (<>
          <li>
            <Link href="/" legacyBehavior>
              {mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">home</span> : <a>Home</a>}
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              {mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">info</span> : <a>About</a>}
            </Link>
          </li>
          <li>
            <Link href="/login" legacyBehavior>
              {mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">login</span> : <a>Login</a>}
            </Link>
          </li>
          <li>
            <Link href="/join" legacyBehavior>
              {mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">person_add</span> : <a>Join</a>}
            </Link>
          </li>
          </>)}
          {user?.isLoggedIn === true && (
            <>
              <li>
                <Link href="/dashboard" legacyBehavior>
                  {mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">space_dashboard</span> : <a>Dashboard</a>}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/account" legacyBehavior>
                  <a>
                    <Image
                      src={user.profilePicture ? user.profilePicture : "/default-pfp.jpg" }
                      width={32}
                      height={32}
                      style={{
                        marginRight: ".3em",
                        verticalAlign: "middle",
                        borderRadius: "100%",
                        overflow: "hidden",
                      }}
                      quality={85}
                      alt=""
                    />
                    {!mobile && 'Account'}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/tasks/new" legacyBehavior>
                  <a><span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined icon-list">add_task</span>{!mobile && 'New task'}</a>
                </Link>
              </li>
              <li>
                <Link href="/collections/new" legacyBehavior>
                  <a><span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined icon-list">playlist_add_check</span>{!mobile && 'New collection'}</a>
                </Link>
              </li>
              {user?.permissions.admin === true && (
                <li>
                  <Link href="/admin" legacyBehavior>
                    {mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">shield</span> : <a>Admin</a>}
                  </Link>
                </li>
              )}
              <li>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/auth"
                  onClick={async (e) => {
                    e.preventDefault();
                    mutateUser(
                      await fetchJson("/api/auth", { method: "DELETE" }),
                      false,
                    );
                    router.push("/login");
                  }}
                >
                  {mobile ? <span style={{ color: "inherit" }} className="material-symbols-outlined">logout</span> : 'Logout' }
                </a>
              </li>
            </>
          )}
          <li>
            <Image
              src="/tracktaskmini.png"
              width="32"
              height="32"
              alt=""
            />
          </li>
        </ul>
      </nav>
      <style jsx>{`
        ul {
          display: flex;
          list-style: none;
          margin-left: 0;
          padding-left: 0;
          overflow: auto;
          white-space: nowrap;
        }

        li {
          margin-right: 2.5rem;
          display: flex;
        }
        
        @media only screen and (max-width: 600px) {
          ul {
            padding-left: 2rem;
          }
          li {
            margin-right: 2rem;
          }
        }

        li:first-child {
          margin-left: auto;
        }

        a {
          color: #fff;
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        a img {
          margin-right: 1em;
        }

        header {
          padding: 0.2rem;
          color: #fff;
          font-weight: 500;
          background-color: var(--header-color);
        }
      `}</style>
    </header>
  );
}
