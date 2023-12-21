<script setup>
    import { ref } from 'vue';

    import { niceNumber, getWheels, getPokeDiff, getInsetDiff, tireHeight, getPctDiff, getPctDiffUnform } from '../pages/calcs.js';

    const props = defineProps({
        rows:{
            type: Number,
            default: 1
        }
    });

    const checklistcontainer = ref();
    var n_errors = 0;
    var n_warnings = 0;
    var n_entries = 0;

    // check new setup against OEM specs
    function checkSetup(OEMS, UPGRADE){
        // wheels
        if(UPGRADE.wheels){
            // check bolt pattern
            addRow(
                "Bolt Pattern ("+UPGRADE.wheels.holes+"&times;"+UPGRADE.wheels.pcd+")",
                [], (bpEqual(OEMS, UPGRADE) ? [] : [
                    "The bolt pattern does not match your vehicle's."
            ]));

            // check centre bore
            addRow("Centre Bore ("+UPGRADE.wheels.bore+" mm)",
                // centre bore too small, warn and advise hubcentric rings
                (OEMS.wheels.bore < UPGRADE.wheels.bore ?
                    ["Your vehicle's centre bore is smaller than on these wheels. Some vehicles may require hub-centric rings."] : []),
                // centre bore is too big, error
                (OEMS.wheels.bore > UPGRADE.wheels.bore ?
                    ["Your vehicle's centre bore is too large to mount these wheels."] : [])
            );
            
            // check wheel diameter
            addRow("Wheel Diameter ("+UPGRADE.wheels.diameter+"&quot;)",
                // brake interference
                (OEMS.wheels.diameter > UPGRADE.wheels.diameter ?
                    ["Smaller diameter wheels may interfere with your vehicle's brakes."] : []),
                // need tires as well
                (!UPGRADE.tires && OEMS.wheels.diameter!=UPGRADE.wheels.diameter ?
                    ["This setup will require new tires as well."] : [])
            );
            
            // check offset
            let offset_diff = Math.abs(OEMS.wheels.offset-UPGRADE.wheels.offset);
            let offset_direction = OEMS.wheels.offset<UPGRADE.wheels.offset ? "in" : "out";
            addRow("Wheel Offset ("+UPGRADE.wheels.offset+" mm)",
                // not exact offset match
                (offset_diff ?
                    ["The offset moves the contact patch centres "+offset_diff+" mm further "+offset_direction+"."] : [])
            );

            // check inset of wheel rim
            let inset_diff = getInsetDiff(UPGRADE.wheels.width, UPGRADE.wheels.offset, OEMS.wheels.width, OEMS.wheels.offset);
            let inset_direction = inset_diff>0 ? "in" : "out";
            addRow("Wheel Inset ("+niceNumber(inset_diff)+" mm)",
                // large inset
                (inset_diff>5 ?
                    ["This may cause interference between the tire and suspension."] : []),
                [],
                (inset_diff ?
                    ["The offset and width will put the inner wheel rim "+niceNumber(Math.abs(inset_diff))+" mm further "+inset_direction+"."] : [])
            );

            // check poke of wheel rim
            let poke_diff = getPokeDiff(UPGRADE.wheels.width, UPGRADE.wheels.offset, OEMS.wheels.width, OEMS.wheels.offset);
            let poke_direction = poke_diff<0 ? "in" : "out";
            addRow("Wheel Poke ("+niceNumber(poke_diff)+" mm)",
                // large wheel poke
                (poke_diff>5 ?
                    ["This may cause interference between the tire and wheel arch or fender."] : []),
                [],
                (poke_diff ?
                    ["The offset and width will put the wheel face/outer wheel rim "+niceNumber(Math.abs(poke_diff))+" mm further "+poke_direction+"."] : [])
            );
        }

        // tires
        if(UPGRADE.tires){
            // check wheel diameter
            if(!UPGRADE.wheels){ // only do diameter if wheels aren't present, otherwise this will have already been checked.
                addRow("Wheel Diameter ("+UPGRADE.tires.diameter+"&quot;)",
                    // brake interference
                    (OEMS.tires.diameter > UPGRADE.tires.diameter ?
                        ["Smaller diameter wheels may interfere with your vehicle's brakes."] : []),
                    // need wheels as well
                    (!UPGRADE.wheels && OEMS.tires.diameter!=UPGRADE.tires.diameter ?
                        ["This setup will require new wheels as well."] : [])
                );
            }

            
            // check tire height
            let old_height = tireHeight(OEMS.tires.diameter, OEMS.tires.ratio, OEMS.tires.section);
            let new_height = tireHeight(UPGRADE.tires.diameter, UPGRADE.tires.ratio, UPGRADE.tires.section);
            let pct_diff_form = getPctDiff(old_height, new_height);
            let pct_diff = getPctDiffUnform(old_height, new_height);
            let diff_direction = (pct_diff>0 ? "taller" : "shorter");
            let tire_message = "These tires are "+pct_diff_form+" "+diff_direction+" than your vehicle's.";
            addRow("Tire Height ("+pct_diff_form+")",
                // tire height different
                (Math.abs(pct_diff)>2 ?
                    [tire_message] : []),
                [],
                (Math.abs(pct_diff)<=2 && pct_diff>0.1 ?
                    [tire_message] : []),
            );

            // check tire section
            let section_diff = Math.abs(UPGRADE.tires.section-OEMS.tires.section);
            let section_diff_form = niceNumber(section_diff);
            let section_wider = UPGRADE.tires.section>OEMS.tires.section;
            addRow("Tire Section ("+UPGRADE.tires.section+" mm)",
                // tire section different
                (section_diff ?
                    // wider or narrower
                    ["These tires are "+section_diff_form+" mm "+(section_wider ? "wider" : "narrower")+" than your vehicle's. "+
                        (section_wider ?
                        "This may cause rubbing." : // wider
                        "This may lead to a narrower contact patch." // narrower
                    )] : []) // the same
            );
        }

        // wheels AND tires
        if(UPGRADE.wheels && UPGRADE.tires){
            // check fitment of tires on wheels
            let legal_widths = getWheels(UPGRADE.tires.section, UPGRADE.tires.ratio);
            addRow("Wheel Width ("+UPGRADE.wheels.width+"&quot;)",
                [],
                (UPGRADE.wheels.width<legal_widths[0] ?
                    // wheels are too narrow
                    ["These wheels are too narrow for the specified tires."] : (
                        (UPGRADE.wheels.width>legal_widths[1] ?
                            // wheels are too narrow
                            ["These wheels are too wide for the specified tires."] : []
                        )
                    )
                )
            );
        }

        // query is wheels BUT NOT tires
        if(UPGRADE.wheels && !UPGRADE.tires){
            // check fitment of tires on wheels
            let legal_widths = getWheels(OEMS.tires.section, OEMS.tires.ratio);
            addRow("Wheel Width ("+UPGRADE.wheels.width+"&quot;)",
                [],
                (UPGRADE.wheels.width<legal_widths[0] ?
                    // wheels are too narrow
                    ["These wheels are too narrow for your OEM tires."] : (
                        (UPGRADE.wheels.width>legal_widths[1] ?
                            // wheels are too narrow
                            ["These wheels are too wide for your OEM tires."] : []
                        )
                    )
                )
            );
        }

        // query is tires BUT NOT wheels
        if(!UPGRADE.wheels && UPGRADE.tires){
            // check fitment of tires on wheels
            let legal_widths = getWheels(UPGRADE.tires.section, UPGRADE.tires.ratio);
            addRow("Wheel Width ("+OEMS.wheels.width+"&quot;)",
                [],
                (OEMS.wheels.width<legal_widths[0] ?
                    // wheels are too narrow
                    ["Your OEM wheels are too narrow for these tires."] : (
                        (OEMS.wheels.width>legal_widths[1] ?
                            // wheels are too narrow
                            ["Your OEM wheels are too wide for these tires."] : []
                        )
                    )
                )
            );
        }
    }

    // compare two bolt patterns
    function bpEqual(wheel1, wheel2){
        return wheel1.wheels.holes==wheel2.wheels.holes &&
            wheel1.wheels.pcd==wheel2.wheels.pcd;
    }

    // return number of rows
    function getRows(){
        return n_entries;
    }

    // clear old rows
    function clearRows(){
        // clear each (EXCEPT header row)
        let old_rows = checklistcontainer.value.querySelectorAll("tr");
        for(let r=0; r<old_rows.length; r++){
            old_rows[r].remove();
        }

        // reset numbers
        n_entries = 0;
        n_errors = 0;
        n_warnings = 0;
    }

    function addRow(title, warnings = [], errors = [], notes = []){
        // add to the number of warnings and errors in total for this table
        const errors_count = errors.length;
        const warnings_count = warnings.length;
        n_errors += errors_count;
        n_warnings += warnings_count;
        n_entries ++;

        // create new table row
        let new_row = document.createElement("tr");

        // add info level (pass, warning or error)
        let ll_cell = document.createElement("td");
        let ll_img = document.createElement("img");
        // create icon
        ll_img.setAttribute("src", "/assets/circle-"+(errors_count ? 'error' : (warnings_count ? 'warning' : 'checkmark'))+".svg");
        ll_cell.append(ll_img);
        new_row.append(ll_cell);

        // add row title/label
        let info_cell = document.createElement("td");
        info_cell.innerHTML = title;

        const notices = {
            note: notes,
            error: errors,
            warning: warnings
        }
        for(var notice in notices){
            if(notices[notice].length){
                let notice_list = document.createElement("ul");
                notice_list.classList.add(notice)
                for(let point of notices[notice]){
                    let li = document.createElement("li");
                    li.innerHTML = point;
                    notice_list.append(li);
                }
                info_cell.append(notice_list);
            }
        }

        new_row.append(info_cell);
        checklistcontainer.value.append(new_row);
    }

    defineExpose({
        checkSetup,
        addRow,
        clearRows,
        getRows,
    });
</script>

<template>
    <table class="checklist" ref="checklistcontainer">
    </table>
</template>

<style>
    table.checklist td {
        vertical-align: middle;
    }
    table.checklist td:nth-child(1), table.checklist th:nth-child(1), table.checklist td img {
        width: calc(var(--font-size) * 1.6);
        height: calc(var(--font-size) * 1.6);
        padding-right: 0pt;
        vertical-align: top;
    }
    table.checklist td:nth-child(n+1), table.checklist th:nth-child(n+1) {
        text-align: left;
    }

    table.checklist ul {
        list-style-type: none;
        line-height: 1.2;
        margin: 0;
        padding: 0;
    }
    table.checklist li {
        margin: 4pt 0 4pt 0;
        padding-left: 8pt;
    }
    ul.warning li { border-left: 2pt solid var(--color-accent4); }
    ul.error li   { border-left: 2pt solid var(--color-accent5); }
    ul.note li    { border-left: 2pt solid var(--color-accent3); }
</style>