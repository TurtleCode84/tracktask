import fetchJson from "lib/fetchJson";
import { useRouter } from "next/router";

export default function ReportButton({ type, reported }) {
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
    ><button><span style={{ color: "red" }} className="material-symbols-outlined icon-list">report</span> Report abuse</button></a>
    <p className="error" id="reportShareMessage" style={{ color: "brown", margin: "1rem 0 0" }}></p>
    </>);
}