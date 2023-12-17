<script setup>
    import { ref } from 'vue';

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