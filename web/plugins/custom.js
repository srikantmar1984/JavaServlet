
$(function () {
    $(".select2").select2();

//  Excel file upload and read

    $("#input").on("click", function () {
        var excelFile,
                fileReader = new FileReader();

        $("#result").hide();

        fileReader.onload = function (e) {
            var buffer = new Uint8Array(fileReader.result);

            $.ig.excel.Workbook.load(buffer, function (workbook) {
                var column, row, newRow, cellValue, columnIndex, i,
                        worksheet = workbook.worksheets(0),
                        columnsNumber = 0,
                        gridColumns = [],
                        data = [],
                        worksheetRowsCount;

                // Both the columns and rows in the worksheet are lazily created and because of this most of the time worksheet.columns().count() will return 0
                // So to get the number of columns we read the values in the first row and count. When value is null we stop counting columns:
                while (worksheet.rows(0).getCellValue(columnsNumber)) {
                    columnsNumber++;
                }

                // Iterating through cells in first row and use the cell text as key and header text for the grid columns
                for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                    column = worksheet.rows(0).getCellText(columnIndex);
                    gridColumns.push({headerText: column, key: column});
                }

                // We start iterating from 1, because we already read the first row to build the gridColumns array above
                // We use each cell value and add it to json array, which will be used as dataSource for the grid
                for (i = 1, worksheetRowsCount = worksheet.rows().count(); i < worksheetRowsCount; i++) {
                    newRow = {};
                    row = worksheet.rows(i);

                    for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                        cellValue = row.getCellText(columnIndex);
                        newRow[gridColumns[columnIndex].key] = cellValue;
                    }

                    data.push(newRow);
                }

                // we can also skip passing the gridColumns use autoGenerateColumns = true, or modify the gridColumns array
                createGrid(data, gridColumns);
            }, function (error) {
                $("#result").text("The excel file is corrupted.");
                $("#result").show(1000);
            });
        }

        if (this.files.length > 0) {
            excelFile = this.files[0];
            if (excelFile.type === "application/vnd.ms-excel" || excelFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || (excelFile.type === "" && (excelFile.name.endsWith("xls") || excelFile.name.endsWith("xlsx")))) {
                fileReader.readAsArrayBuffer(excelFile);
            } else {
                $("#result").text("The format of the file you have selected is not supported. Please select a valid Excel file ('.xls, *.xlsx').");
                $("#result").show(1000);
            }
        }

    })
});

function createGrid(data, gridColumns) {
    if ($("#grid1").data("igGrid") !== undefined) {
        $("#grid1").igGrid("destroy");
    }

    $("#grid1").igGrid({
        columns: gridColumns,
        autoGenerateColumns: true,
        dataSource: data,
        width: "100%"
    });
}



function fillEmpType() {
    $.ajax({
        type: 'POST'
        , url: location.hostname + "/../ohp/ohp_admin_action.php"
        , async: false
        , data: {act: 'fillEmpType'}
        , complete: function (request, status)
        {
            if (status == "success")
            {
                var data = JSON.parse(request.responseText);
                $('#ddlFilterEmpType option').remove();
                $('#ddlFilterEmpType').append('<option value="">All Employee Type</option>');
                for (var intctr = 0; intctr < data.length; intctr++)
                {
                    $('#ddlFilterEmpType').append('<option value="' + data[intctr].TypeID + '">' + data[intctr].TypeName + '</option>');
                }
            }
        }
    });
}

function fillDivision(locnid) {
    
    
    $.ajax({
        type: 'POST'
        , url: location.hostname + "/../ohp/ohp_admin_action.php"
        , async: false
        , data: {act: 'fillDivision', locn: locnid, scr_id: $('#hdnPageID').val()}
        , complete: function (request, status)
        {
            $('.ddlFilterLoc').val(locnid);
            if (status == "success")
            {
                var data = JSON.parse(request.responseText);
                $('.ddlFilterDivName option').remove();
                for (var intctr = 0; intctr < data.length; intctr++)
                {
                    $('.ddlFilterDivName').append('<option value="' + data[intctr].DivID + '">' + data[intctr].DivName + '</option>');
                }
            }
        }
    });
    fillAgency(locnid);
}
function fillLocation() {
    $.ajax({
        type: 'POST'
        , url: location.hostname + "/../ohp/ohp_admin_action.php"
        , async: false
        , data: {act: 'fillLocation'}
        , complete: function (request, status)
        {
            if (status == "success")
            {
                var data = JSON.parse(request.responseText);
                $('.ddlFilterLoc option').remove();
                for (var intctr = 0; intctr < data.length; intctr++)
                {
                    $('.ddlFilterLoc').append('<option value="' + data[intctr].LocnID + '">' + data[intctr].LocnName + '</option>');
                }
                fillDivision($('.ddlFilterLoc').val());
            }
        }
    });
}

function fillAgency(locnid) {
    var emptype = $("#ddlFilterEmpType").val();
    $.ajax({
        type: 'POST'
        , url: location.hostname + "/../ohp/ohp_admin_action.php"
        , data: {act: 'fillAgency', locn: locnid}
        , complete: function (request, status)
        {
            if (status == "success")
            {
                var data = JSON.parse(request.responseText);
                $('#ddlFilterAgncyName option').remove();
                $('#ddlFilterAgncyName').append('<option value="All">All Contractors</option>');
                for (var intctr = 0; intctr < data.length; intctr++)
                {
                    $('#ddlFilterAgncyName').append('<option value="' + data[intctr].AGENCYNAME + '">' + data[intctr].AGENCYNAME + '</option>');
                }
            }
        }
    });
}
function sidebar() {
    $("#filterColumn").click(function () {
        if (!$(".control-sidebar").hasClass("control-sidebar-open")) {
            $(".control-sidebar").addClass("control-sidebar-open");
        } else {
            $(".box").find(".control-sidebar-open").removeClass("control-sidebar-open");
        }
        $("#btnDone").click(function () {
            $(".box").find(".control-sidebar-open").removeClass("control-sidebar-open");
        });
    });

    $('input[type="checkbox"].flat-red').iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
}
function isEmpty(val){
    if (typeof val != 'undefined' && val && val!=' ') {
        return true;
    }
}
function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}
 