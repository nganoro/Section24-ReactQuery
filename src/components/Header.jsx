import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  /** 0 if react query is fetching, higher number if not */
  /** this is a global loading icon */
  const fetching = useIsFetching();

  return (
    <>
      <div id="main-header-loading">
        {fetching > 0 && <progress />}
      </div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
