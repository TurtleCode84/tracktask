import React, { useState, useEffect } from "react";
import Link from "next/link";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Image from "next/image";
import fetchJson from "lib/fetchJson";

export default function Header() {
  const { user, mutateUser } = useUser();
  const router = useRouter();

  const [mobile, setMobile] = useState(true);

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
              <a>{mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">home</span> : 'Home'}</a>
            </Link>
          </li>
          <li>
            <Link href="/about" legacyBehavior>
              <a>{mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">info</span> : 'About'}</a>
            </Link>
          </li>
          <li>
            <Link href="/login" legacyBehavior>
              <a>{mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">login</span> : 'Login'}</a>
            </Link>
          </li>
          <li>
            <Link href="/join" legacyBehavior>
              <a>{mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">person_add</span> : 'Join'}</a>
            </Link>
          </li>
          </>)}
          {user?.isLoggedIn === true && (
            <>
              <li>
                <Link href="/dashboard" legacyBehavior>
                  <a>{mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">home</span> : 'Dashboard'}</a>
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
                        marginRight: mobile ? "0" : ".3em",
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
                  <a><span style={{ color: "white", margin: "0 5px 0 0", fontSize: "24px" }} className="material-symbols-outlined icon-list">playlist_add_check</span>{!mobile && 'New collection'}</a>
                </Link>
              </li>
              {user?.permissions.admin === true && (
                <li>
                  <Link href="/admin" legacyBehavior>
                    <a>{mobile ? <span style={{ color: "white", margin: "0 5px 0 0", fontSize: "18px" }} className="material-symbols-outlined">shield</span> : 'Admin'}</a>
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
          white-space: nowrap;
        }

        li {
          display: flex;
        }

        a {
          color: #fff;
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        header {
          padding: 0.2rem;
          color: #fff;
          font-weight: 500;
          background-color: var(--header-color);
          overflow: auto;
        }

        @media only screen and (max-width: 600px) {
          ul {
            padding-left: 2rem;
          }
          li {
            margin-right: auto;
            margin-left: auto;
          }
          li:first-child {
            margin-left: 0;
          }
          a img {
            margin-right: auto;
          }
        }

        @media only screen and (min-width: 600px) {
          li {
            margin-right: 2.5rem;
          }
          li:first-child {
            margin-left: auto;
          }
          a img {
            margin-right: 1em;
          }
        }
      `}</style>
    </header>
  );
}
