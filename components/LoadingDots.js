export default function LoadingDots() {
  return (
    <><div id="loading">
        <div class="dot a"></div>
        <div class="dot b"></div>
        <div class="dot c"></div>
      </div>
    <style jsx global>{`
      #loading {
        display: flex;
        margin: 50px auto;
        width: 4.5em;
      }

      @keyframes move {
        0%, 100% {
          transform: translate(0, 0px);
          animation-timing-function: ease-out;
        }
        50% {
          transform: translate(0, -25px);
          animation-timing-function: ease-in;
        }
      }

      .dot {
        width: 1em;
        height: 1em;
        background: grey;
        border-radius: 50%;
        margin: 0.25em;
        animation: move 1.2s linear infinite;
      }

      .a {
        animation-delay: 0.2s;
      }
      .b {
        animation-delay: 0.4s;
      }
      .c {
        animation-delay: 0.6s;
      }
    `}
    </style></>
  );
}
