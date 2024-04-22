export default function dynamicToggle(event, element, scroll = ["start", "end"]) {
    event.preventDefault();
    const section = document.getElementById(element);
    section.open = section.open ? false : true;
    section.scrollIntoView({ behavior: "smooth", block: section.open ? scroll[0] : scroll[1], inline: "nearest" });
}