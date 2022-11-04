import { useRouter } from "next/router";

export default function ReportButton({ type, reported, reason }) {
    const router = useRouter();
    return (<>
    <a href={"/api/reports"}
        onClick={async (e) => {
        e.preventDefault();
        const reason = prompt("Reason for reporting:");
        if (reason.trim() !== "") {
        try {
            await fetchJson("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: type,
                    reported: reported,
                    reason: reason.trim(),
                }),
            });
            router.push("/dashboard?reported=true");
        } catch (error) {
            document.getElementById("reportShareMessage").innerHTML = error.data.message;
        }
        }
        }}
    ><button><span style={{ color: "red" }} className="material-symbols-outlined icon-list">report</span> Report</button></a>
    <p className="error" id="reportShareMessage"></p>
    </>);
}