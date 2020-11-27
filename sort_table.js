'use strict';
function makeTableSortable() {
     // In first column (773$$q/830$$v) implement special sort
     function compareValues (v1, v2) {

         const comparisonResult = [];
         const maxLength = Math.max(v1.length, v2.length);
         const lengthDiffV1V2 = v1.length - v2.length;
         const reFromTo = /[/-][^.,]+/;

         for (let i=0; i < maxLength; i++) {

             let localCompare;
             let v1Current;
             let v2Current;
             let v1FromTo;
             let v2FromTo;

             try {
                 v1Current = v1[i].replace(/^(\d+)[a-zA-Z]/, '$1').replace(reFromTo, '');
                 v1FromTo = v1[i].match(reFromTo);
                 v2Current = v2[i].replace(/^(\d+)[a-zA-Z]/, '$1').replace(reFromTo, '');
                 v2FromTo = v2[i].match(reFromTo);
             } catch(error) {
                 //console.log(error);
                 continue;
             }

             if ( typeof v1Current !== 'undefined' && typeof v2Current !== 'undefined' ) {

                 if ( !isNaN(v1Current) && !isNaN(v2Current) ) {
                     localCompare = v1Current - v2Current;
                 } else {
                     localCompare = v1Current.toString().localeCompare(v2Current);
                 }

                 if (localCompare === 0 && v1FromTo && v2FromTo) {
                     localCompare = v1[i].localeCompare(v2[i]);
                 } else if (localCompare === 0 && v1FromTo) {
                     localCompare = 1;
                 } else if (localCompare === 0 && v2FromTo) {
                     localCompare = -1;
                 }

                 comparisonResult.push(localCompare);
             }
         }
         // console.log("v1 " + v1 + " and v2 " + v2 + " resulted in " + comparisonResult);

         if ( comparisonResult.every(x => x === 0) ) {
             if ( lengthDiffV1V2 > 0 || v1[0].match(reFromTo) ) {
                 return 1;
             } else if ( lengthDiffV1V2 < 0 || v2[0].match(reFromTo) ) {
                 return -1;
             } else {
                 return 0;
             }
         } else if ( comparisonResult.every(x => x >= 0) ) {
             return 1;
         } else if ( comparisonResult.every(x => x <= 0) ) {
             return -1;
         } else {
             for (let j=0; j < comparisonResult.length; j ++) {
                 if (comparisonResult[j] < 0) {
                     return -1;
                 } else if (comparisonResult[j] === 0) {
                     continue;
                 } else {
                     return 1;
                 }
             }
         }
     }

     // kudos https://stackoverflow.com/questions/14267781
     let asc;

     const reNichtsortier = /<<[^>]*>> */;
     const reSplitter = /[,. ]/;

     const getCellValue = (tr, idx) => idx == 0 ? tr.children[idx].innerText.split(reSplitter) || tr.children[idx].textContent.split(reSplitter) : [tr.children[idx].innerText.replace(reNichtsortier, '')] || [tr.children[idx].textContent.replace(reNichtsortier, '')];

     const comparer = (idx, asc) => (a, b) => ((v1, v2) => compareValues(v1, v2)
         )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
     
     document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
         const table = th.closest('table');
         const tbody = table.querySelector('tbody');
         Array.from(tbody.querySelectorAll('tr'))
             .sort(comparer(Array.from(th.parentNode.children).indexOf(th), asc = !asc))
             .forEach(tr => tbody.appendChild(tr) );

         const allTh = th.parentNode.children;
         for (let i = 0; i < allTh.length; i ++) { allTh[i].setAttribute("class", ""); }
         th.setAttribute("class", asc ? "ascending" : "descending");
     })));
}

