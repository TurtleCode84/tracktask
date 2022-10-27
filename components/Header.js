import Link from "next/link";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Image from "next/image";
import fetchJson from "lib/fetchJson";

export default function Header() {
  const { user, mutateUser } = useUser();
  const router = useRouter();

  return (
    <header>
      <nav>
        <ul>
          {user?.isLoggedIn === false && (<>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/join">Join</Link>
          </li>
          </>)}
          {user?.isLoggedIn === true && (
            <>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link href="/dashboard/account">
                  <span
                    style={{
                      marginRight: ".3em",
                      verticalAlign: "middle",
                      borderRadius: "100%",
                      overflow: "hidden",
                    }}
                  >
                  <Image
                    src={user.profilePicture ? user.profilePicture : "/default-pfp.jpg" }
                    width={32}
                    height={32}
                    alt=""
                  />
                  </span>
                  Account
                </Link>
              </li>
              <li>
                <Link href="/tasks/new"><span style={{ color: "white", margin: "0 5px 0 0" }} className="material-symbols-outlined icon-list">add_task</span>New task</Link>
              </li>
              <li>
                <Link href="/collections/new"><span style={{ color: "white", margin: "0 5px 0 0" }} className="material-symbols-outlined icon-list">playlist_add_check</span>New collection</Link>
              </li>
              {user?.permissions.admin === true && (
                <li>
                  <Link href="/admin">Admin</Link>
                </li>
              )}
              <li>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/logout"
                  onClick={async (e) => {
                    e.preventDefault();
                    mutateUser(
                      await fetchJson("/api/logout", { method: "POST" }),
                      false,
                    );
                    router.push("/login");
                  }}
                >
                  Logout
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
          background-color: #333;
        }
      `}</style>
    </header>
  );
}
