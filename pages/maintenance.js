import React from "react";
import Layout from "components/Layout";

export default function Maintenance() {
    return (
        <Layout>
            <h1 style={{fontSize: 48, marginBottom: "0px"}}><span style={{color: "#006dbe", fontSize: "inherit"}} className="material-symbols-outlined">engineering</span> Maintenance in Progress</h1>
            <h3>We&apos;re working on improving your user experience, TrackTask will be back online as soon as possible.</h3>
            <p>Thank you for your patience & cooperation!</p>
        </Layout>
    );
}
