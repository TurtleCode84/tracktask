import React from "react";
import Layout from "components/Layout";
import { useRouter } from "next/router";

const router = useRouter();

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
   
      // Define a state variable to track whether is an error or not
      this.state = { hasError: false, errorMsg: null }
    }
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI
   
      return { hasError: true, errorMsg: error.message }
    }
    componentDidCatch(error, errorInfo) {
      // You can use your own error logging service here
      console.log({ error, errorInfo })
    }
    render() {
      // Check if the error is thrown
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return (
          <Layout>
            <h1 style={{marginBottom: "0px", marginTop: "60px"}}><span style={{color: "red", fontSize: "inherit"}} className="material-symbols-outlined">error</span> 500: A client-side error occurred during rendering.</h1>
            <h3>We&apos;re not sure why this happened, but the error has been reported and will be resolved as soon as possible.</h3>
            <p>In the meantime, you probably want to go back to <a href="" onClick={(e) => {
              e.preventDefault();
              this.setState({ hasError: false, errorMsg: error.message });
              router.push("/");
            }}>a page that does work</a>?</p>
            <details style={{ fontSize: "90%", color: "darkgray" }}>
              <summary>More details</summary>
              <textarea>{this.state.errorMsg}</textarea>
            </details>
          </Layout>
        )
      }
   
      // Return children components in case of no error
   
      return this.props.children
    }
  }
   
export default ErrorBoundary