import React from "react";
import Layout from "components/Layout";

export default function Custom404() {
    return (
        <Layout>
            <h1 style={{fontSize: 50, marginBottom: "0px"}}><span style={{color: "#006dbe", fontSize: "inherit"}} className="material-symbols-outlined">help</span> 404: This page could not be found.</h1>
            <h3>We're not sure how you got here, but we couldn't find the page you were looking for. Maybe there's a typo in the URL?</h3>
            <p>In the meantime, you probably want to go back to <a href="/">a page that does exist</a>?</p>
        </Layout>
    );
}