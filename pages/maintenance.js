import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";

export default function Maintenance() {
    if (process.env.NEXT_PUBLIC_MAINTENANCE) {
        return (
            <Loading />
        );
    }
    return (
        <Layout>
            <h1 style={{fontSize: 50, marginBottom: "-10px"}}><span style={{color: "#006dbe", fontSize: "inherit"}} className="material-symbols-outlined">engineering</span> Maintenance In Progress</h1>
            <h3>We&apos;re working on improving your user experience, TrackTask will be back online as soon as possible.</h3>
            <p>Thank you for your patience & cooperation!</p>
        </Layout>
    );
}
