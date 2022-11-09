import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";

export default function Maintenance() {
    if (process.env.NEXT_PUBLIC_MAINTENANCE !== "true") {
        return (
            <Loading />
        );
    }
    return (
        <Layout>
            <h1 style="font-size: 50; padding-top: 5px; line-height: 0px">
                <span style="color: #006dbe" class="material-symbols-outlined">engineering</span> Maintenance In Progress
            </h1>
            <h3 style="font-size: 20; line-height: 0px">We&apos;re working on improving your user experience, TrackTask will be back online as soon as possible.</h3>
            <p style="line-height: 45px">Thank you for your patience & cooperation!</p>
        </Layout>
    );
}
