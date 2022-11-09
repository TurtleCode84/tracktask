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
            <h1 style={{fontSize: 50}}><span style={{color: "#006dbe"}} className="material-symbols-outlined icon-list">engineering</span> Maintenance In Progress</h1>
            <h3>We&apos;re working on improving your user experience, TrackTask will be back online as soon as possible.</h3>
            <p>Thank you for your patience & cooperation!</p>
        </Layout>
    );
}
