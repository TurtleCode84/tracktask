import React from "react";
import Layout from "components/Layout";

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false, errorMsg: null }
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, errorMsg: error.message }
    }
    componentDidCatch(error, errorInfo) {
      console.log({ error, errorInfo })
    }
    render() {
      if (this.state.hasError) {
        return (
          <Layout>
            <h1 style={{marginBottom: "0px", marginTop: "60px"}}><span style={{color: "red", fontSize: "inherit"}} className="material-symbols-outlined">error</span> 500: A client-side error occurred during rendering.</h1>
            <h3>We&apos;re not sure why this happened, but the error has been reported and will be resolved as soon as possible.</h3>
            <p>In the meantime, you probably want to go back to <a href="" onClick={(e) => {
              e.preventDefault();
              window.location.replace("/");
            }}>a page that does work</a>?</p>
            {/* This details element does not need dynamic toggling */}
            <details style={{ fontSize: "90%", color: "darkgray" }}>
              <summary>More details</summary>
              <textarea disabled>{this.state.errorMsg}</textarea>
            </details>
          </Layout>
        )
      }
   
      return this.props.children
    }
  }
   
export default ErrorBoundary