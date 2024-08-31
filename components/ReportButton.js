import fetchJson from "lib/fetchJson";
import { useRouter } from "next/router";

export default function ReportButton({ type, reported, flag }) {
    const router = useRouter();
    return (<>
    <a href={"/api/reports"}
        onClick={async (e) => {
        e.preventDefault();
        var reason = "";
        if (flag) {
            reason = prompt("Reason for flagging:");
        } else {
            reason = prompt("Reason for reporting:");
        }
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
            if (flag) {
                router.push("/admin/reports");
            } else {
                router.push("/dashboard?reported=true");
            }
        } catch (error) {
            document.getElementById("reportMessage").innerHTML = error.data?.message || "An error occurred.";
        }
        }
        }}
    ><button>{flag ? <><span style={{ color: "red" }} className="material-symbols-outlined icon-list">flag</span> Flag for review</> : <><span style={{ color: "red" }} className="material-symbols-outlined icon-list">report</span> Report abuse</>}</button></a>
    <p className="error" id="reportMessage"></p>
    </>);
}