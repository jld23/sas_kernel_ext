%macro date_loop(start,end);
   %let start=%sysfunc(inputn(&start,anydtdte9.));
   %let end=%sysfunc(inputn(&end,anydtdte9.));
   %let dif=%sysfunc(intck(month,&start,&end));
     %do i=0 %to &dif;
      %let date=%sysfunc(intnx(month,&start,&i,b),date9.);
      %put &date;
     %end;
%mend date_loop;

%date_loop(01jul2015,01feb2016)





data chisq;
input df;
chirat = cinv(.995,df)/cinv(.005,df);
datalines;
20
21
22
23
24
25
26
27
28
29
30
;
run;
 
proc print data=chisq;
var df chirat;
run;
 
proc plot data=chisq;
plot chirat*df;
run;