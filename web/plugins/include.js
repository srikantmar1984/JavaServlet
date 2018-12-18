var URL = location.hostname + "/../TrainingControl/trainingController.php";
var absentUserID = [];
var presentUserID = [];
$(function () {
    $('.select2').select2();
    dateTimePick();
    $('#multiselect').multiselect({
        search: {
//                right: '#multi_d_to, #multi_d_to_2',
            rightSelected: '#multiselect_rightSelected',
            leftSelected: '#multiselect_leftSelected',
            rightAll: '#multiselect_rightAll',
            leftAll: '#multiselect_leftAll',
            left: '<input type="text" name="p" class="form-control" placeholder="Search with ticket number or name..." />',
            right: '<input type="text" name="p" class="form-control" placeholder="Search with ticket number or name..." />'
        },
        moveToRight: function (Multiselect, $options, event, silent, skipStack) {
            var button = $(event.currentTarget).attr('id');
            if (button == 'multiselect_rightSelected') {
                var $left_options = Multiselect.$left.find('> option:selected');
                Multiselect.$right.eq(0).append($left_options);
                if (typeof Multiselect.callbacks.sort == 'function' && !silent) {
                    Multiselect.$right.eq(0).find('> option').sort(Multiselect.callbacks.sort).appendTo(Multiselect.$right.eq(0));
                }
            } else if (button == 'multiselect_rightAll') {
                var $left_options = Multiselect.$left.children(':visible');
                Multiselect.$right.eq(0).append($left_options);
                if (typeof Multiselect.callbacks.sort == 'function' && !silent) {
                    Multiselect.$right.eq(0).find('> option').sort(Multiselect.callbacks.sort).appendTo(Multiselect.$right.eq(0));
                }
            }
        },
        moveToLeft: function (Multiselect, $options, event, silent, skipStack) {
            var button = $(event.currentTarget).attr('id');
            if (button == 'multiselect_leftSelected') {
                var $right_options = Multiselect.$right.eq(0).find('> option:selected');
                Multiselect.$left.append($right_options);
                if (typeof Multiselect.callbacks.sort == 'function' && !silent) {
                    Multiselect.$left.find('> option').sort(Multiselect.callbacks.sort).appendTo(Multiselect.$left);
                }
            } else if (button == 'multiselect_leftAll') {
                var $right_options = Multiselect.$right.eq(0).children(':visible');
                Multiselect.$left.append($right_options);
                if (typeof Multiselect.callbacks.sort == 'function' && !silent) {
                    Multiselect.$left.find('> option').sort(Multiselect.callbacks.sort).appendTo(Multiselect.$left);
                }
            }
        }
    });

    $(".sessionCls").on('click', ".plusCls", function () {
        var length = ($(".sessionId").length);
        if (sessionValidation(length - 2)) {
            var sessionClone = $(".sessionDivClass").html();
            $(".sessionCls").append(sessionClone); //.after($("#minusID").clone());
            dateTimePick();
            genSessionNo(1);
            $("#sessionId").find('.sessionBtnClose').remove();
            $(".sessionBtnClose").parent().find('.plusButton').remove();

//        if ($(".minusCls").length == 1) {
//            $(".minusCls").attr('disabled');
//        } else {
//            $(".plusButton").eq((($(".plusButton").length)-1)).hide();
//        $(".minusCls").removeAttr('disabled');
//    }
        }
    });

    $(".sessionCls").on('click', ".sessionBtnClose", function () {
        $(this).parent().parent().parent().hide("slow", function () {
            $(this).remove();
        });
    });
    $("#trainingModule_id").change(function () {
        if ($("#trainingModule_id").val() != '') {
            $("#trainingModule_id").removeClass('has-error');
        }
    });
    $("#training_title").blur(function () {
        if ($("#training_title").val() != '') {
            $("#training_title").removeClass('has-error');
        }
    });
    $("#multiselect_to").blur(function () {
        if ($("#multiselect_to").val() != '') {
            $("#multiselect_to").removeClass('has-error');
        }
    });

    $(".emp_table").on('click', '.employee_id', function () {
        if (!$(this).is(':checked')) {
        }
    });

});

function compareTime(str1, str2) {
    if (str1 === str2) {
        return 0;
    }
    var time1 = str1.split(':');
    var time2 = str2.split(':');
    if (eval(time1[0]) > eval(time2[0])) {
        return 1;
    } else if (eval(time1[0]) == eval(time2[0]) && eval(time1[1]) > eval(time2[1])) {
        return 1;
    } else {
        return -1;
    }
}

function dateTimePick() {
    $('.datepicker').datepicker({
        autoclose: true,
        format: 'd-M-yyyy'
    });
    $(".clockpicker input[name='SchFromTime[]'").clockpicker({
        placement: 'top',
        align: 'left',
        donetext: 'Done',
        autoclose: true,
        default: 'now',
        afterDone: function () {
            var fromtime = $("input[name='SchFromTime[]']").val();
            $("input[name='SchToTime[]'").clockpicker({
                placement: 'top',
                align: 'left',
                donetext: 'Done',
                autoclose: true,
                default: fromtime,
                afterDone: function () {
                    var totime = $("input[name='SchToTime[]']").val();
                    var compare = compareTime(totime, fromtime);
                    if (compare == -1) {
                        $("input[name='SchToTime[]']").val('');
                        alert("Session duration should be greater than 0");
                    }
                }
            });
        }
    }).find('input').change(function () {
    });
}
function getCurrentTime(date) {
    var hours = date.getHours(),
            minutes = date.getMinutes(),
            ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes + ' ' + ampm;
}
function fillModule() {
    $.ajax({
        url: URL,
        global: false,
        type: 'POST',
        data: {act: 'getModule'},
        async: false, //blocks window close
        success: function (res) {
            var moduleOptions = '<option value="">Select Module</option>';
            var result = $.parseJSON(res);
            $.each(result, function (key, val) {
                moduleOptions += "<option value=" + val.ID + ">" + val.MODULE_NAME + "</option>";
            });
            $(".trainingModule").html(moduleOptions);
        }
    });
}
function fillData() {
    fillModule();
    searchTrainingData();
}

function addTraining(selecteddate) {
    $("#trainingModule").html('<select class="form-control trainingModule " name="module_id" id="trainingModule_id" onchange="changeModule(this.value);"></select>');
    fillModule();
    $("#normal_training").iCheck('enable');
    $("#normal_training").iCheck('check');
    $('#master_training').iCheck('enable');
//    $(".datepicker").val(date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
//   
    $("#trainingModule").next().remove();
    $('.sessionId').slice(1).remove();
    $("#ScheduleForm")[0].reset();
    $("#training_id").val('');
    $("input[name='training_type']").val([1]);
    $('.multiselect').html('');
    $(".has-error").removeClass('has-error');
    $("#leftlebel").text("Nominated Employees");
    $("#rightlebel").text("Scheduled Employees");
    trainingSchedule();
    var date = new Date(selecteddate);
    $(".datepicker").datepicker("setDate", date);
//    $("input[name='SchDate[]']").val(date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
}

function trainingSchedule() {
    $("#scheduleModal").modal('show');
//    $("input[name='SchDate[]']").removeAttr('readonly');
//    console.log($("input[name='SchDate[]']").eq(2).val());
    $("input[name='SchDate[]']").eq(1).removeAttr('readonly');
    $(".sessionDivClass").html($("#sessionId").clone());
    $("#sessionId").find('#firstSessionID').hide();
    var training_type = $("input[name='training_type']").val();
    listVanue(training_type);
    $("input[name='training_type']").on('change', function () {
        training_type = $(this).val();
        listVanue(training_type);
    });
}

function checkTNI() {
    var module_id = $("#trainingModule_id").val();
    var emp_id = $("#emp_id").val();
    if (module_id == '') {
        swal("Error!", "you haven't choosed any module yet", "warning");
        return false;
    } else if (emp_id == '') {
        swal("Error!", "you haven't entered ticket number yet", "warning");
        return false;
    } else {
        $.post(URL, {
            act: 'checkTNI',
            data: {emp_id: emp_id, module_id: module_id}
        },
                function (res) {
                    var result = $.parseJSON(res);
                    if (result.status == 0) {
                        swal("Error!", result.msg, "warning");
                    } else {
                        changeModule(module_id);
                        $("#emp_id").val('');
                    }
                });
    }
}
function getTrainingEmp(training_id) {
    var scheduledUserID = [];
    $.post(URL, {
        act: 'getScheduledUser',
        data: training_id
    },
            function (res) {

                $("#training_id").val(training_id);
                var result = $.parseJSON(res);
                var checkbox = '<span id="error" style="color:red"></span><table width=100% class="table emp_table">';
                if (!$.isEmptyObject(result)) {
                    $.each(result, function (key, value) {
                        scheduledUserID.push(value['EMP_ID']);
                        checkbox += `<tr><td width=40%>
                                         <input type=checkbox name='emp_id[]' data-emp_id='` + value['EMP_ID'] + `' data-emp_name='` + value['USER_NAME'] + `' class='minimal-blue employee_id checkBox' value=` + value['EMP_ID'] + `>
                                         &nbsp;&nbsp;
                                         <label>` + value['USER_NAME'] + `(` + value['EMP_ID'] + `)</label></td>
                                         <td width=30%><input style=width:100px; name='preTest[]' id=preTest` + value['EMP_ID'] + `></td>
                                         <td width=30%><input style=width:100px; name='preTest[]' id=postTest` + value['EMP_ID'] + `></td>
                                     <tr>`;
                    });
                }
                checkbox += '</table>';
                if (!$.isEmptyObject(scheduledUserID)) {
                    $("#attdanceModal").modal('show');
                } else {
                    swal("Caution!", "No employees have scheduled for this training!!", "warning");
                }
                $("#search").html(checkbox);
                $("#search_to").html('');
                $('input[type="checkbox"].minimal-blue, input[type="radio"].minimal-blue').iCheck({
                    checkboxClass: 'icheckbox_minimal-blue',
                    radioClass: 'iradio_minimal-blue'
                });

                $('.checkBox').on('ifChanged', function (event) {
                    if ($(".checkBox").length == $(".checkBox:checked").length) {
                        $('#checkAll').iCheck('check');
                    } else {
                        $('#checkAll').iCheck('uncheck');
                    }
                });

            });
    var absentUserID = [];
    var presentUserID = [];

    $(".employee_id").on('click', function () {
        if (!$(this).is(':checked')) {
        }
    });
//    $('#search').multiselect({
//        search: {
//            rightSelected: '#search_rightSelected',
//            leftSelected: '#search_leftSelected',
//            rightAll: '#search_rightAll',
//            leftAll: '#search_leftAll',
//            left: '<input type="text" name="p" class="form-control" placeholder="Search with ticket number or name..." />',
//            right: '<input type="text" name="p" class="form-control" placeholder="Search with ticket number or name..." />'
//        }
//    });



    // backup of 30-5-2018
//    var scheduledUserID = [];
//    $.post(URL, {
//        act: 'getScheduledUser',
//        data: training_id
//    },
//            function (res) {
//                $("#attdanceModal").modal('show');
//                $("#training_id").val(training_id);
//                var result = $.parseJSON(res);
//                var options = '';
//                if (!$.isEmptyObject(result)) {
//                    $.each(result, function (key, value) {
//                        scheduledUserID.push(value['EMP_ID']);
//                        options += "<option value=" + value['EMP_ID'] + ">" + value['USER_NAME'] + "(" + value['EMP_ID'] + ")</option>"
//                    });
//                }
//                $("#search").html(options);
//                $("#search_to").html('');
//            });
//    var absentUserID = [];
//    var presentUserID = [];
//    $('#search').multiselect({
//        search: {
//            rightSelected: '#search_rightSelected',
//            leftSelected: '#search_leftSelected',
//            rightAll: '#search_rightAll',
//            leftAll: '#search_leftAll',
//            left: '<input type="text" name="p" class="form-control" placeholder="Search with ticket number or name..." />',
//            right: '<input type="text" name="p" class="form-control" placeholder="Search with ticket number or name..." />'
//        }
//    });
}

function enablePrePostScore(emp_id) {
}
function updateAttendance() {
    var absentUserID = [];
    var presentUserID = [];
    var prePostTest = {};
    $('[id^=preTest]').removeClass('has-error');
    $('[id^=postTest]').removeClass('has-error');
    $("#error").text('');
    var error = 0;
    var checkedCount = 0;
    $(".employee_id:checkbox:checked").each(function () {
        checkedCount++;
        var emp_id = $(this).val();
        var preTest = $("#preTest" + emp_id).val();
        if (!preTest || isNaN(preTest)) {
            $("#error").text("Please enter pre training score for " + $(this).data('emp_name'));
            $("#preTest" + emp_id).focus();
            $("#preTest" + emp_id).val('');
            $("#preTest" + emp_id).addClass('has-error');
            error++;
            return false;
        } else {
            $("#preTest" + emp_id).removeClass('has-error');
        }
        var postTest = $("#postTest" + emp_id).val();
        if (!postTest || isNaN(postTest)) {
            $("#error").text("Please enter post training score for " + $(this).data('emp_name'));
            $("#postTest" + emp_id).focus();
            $("#postTest" + emp_id).val('');
            $("#postTest" + emp_id).addClass('has-error');
            error++;
            return false;
        } else {
            $("#postTest" + emp_id).removeClass('has-error');
        }
        if (error == 0) {
            presentUserID.push($(this).val());
            prePostTest[emp_id] = {preTest, postTest};
        } else {
            return false;
        }
    });
    $(".employee_id:checkbox:not(:checked)").each(function () {
        absentUserID.push("'" + $(this).val() + "'");
    });
    if (checkedCount == 0) {
        swal({
            title: 'You have marked all employees are absent!!',
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, I am sure!',
            cancelButtonText: "No, cancel it!",
            closeOnConfirm: true,
            closeOnCancel: true
        },
                function (isConfirm) {
                    if (isConfirm) {
                        postAttendance(presentUserID, absentUserID, prePostTest);
                    } else {
                        swal("Cancelled", "Attendance is not updated", "error");
                    }
                });
    } else {
        if (error == 0) {
            postAttendance(presentUserID, absentUserID, prePostTest);
        } else {
            return false;
        }
    }
}

function postAttendance(presentUserID, absentUserID, prePostTest) {
    $.post(URL, {
        act: 'updateAttendance',
        data: {
            'presentUserID': presentUserID.join(),
            'absentUserID': absentUserID.join(),
            'prePostTest': prePostTest,
            'training_id': $("#training_id").val()
        }
    },
            function (res) {
                var result = $.parseJSON(res);
                if (result.status == 1) {
                    $("#attdanceModal").modal('hide');
                    $(".modal-backdrop").removeClass('modal-backdrop fade in');
                    openUrl(this, "TrainingControl/training_calender.php");
                } else {
                    swal("Warning", "Attendance cant be updated", "error");
                }
            });
}
function searchTrainingData() {
    var trainingData = '';
    $.post(URL, {
        act: 'getScheduledTraining',
        data: $("#searchForm").serialize()
    },
            function (res) {
                var result = $.parseJSON(res);
                if (!$.isEmptyObject(result)) {
                    var i = 1;
                    var now = new Date();
                    $.each(result, function (key, value1) {
                        if ($("#ticket_no").val() != '') {
                            var ticket_no = $("#ticket_no").val();
                            if (!((jQuery.inArray(ticket_no, value1['Employees']['present'])) < 0) || !((jQuery.inArray(ticket_no, value1['Employees']['absent'])) < 0) || !((jQuery.inArray(ticket_no, value1['Employees']['scheduled'])) < 0)) {
                                var value = value1['TrainingDetail'];
                                var planned = 0;
                                if (value1['Employees'].hasOwnProperty('scheduled') && value1['Employees']['scheduled'][0] != null) {
                                    planned += ((value1['Employees']['scheduled']).length);
                                } else {
                                    planned += ((value1['Employees'].hasOwnProperty('present')) ? ((value1['Employees']['present']).length) : 0) + ((value1['Employees'].hasOwnProperty('absent')) ? ((value1['Employees']['absent']).length) : 0);
                                }
                                var actual = 0;
                                if (value1['Employees'].hasOwnProperty('present')) {
                                    actual = (value1['Employees']['present']).length;
                                }
                                var trainingDate = new Date(value.TRAINING_START_DATE);
                                var dis = (now.getTime() <= trainingDate.getTime() || value.STATUS == 4) ? 'disabled' : ''; // + ((value.SCHEDULESTATUS == 0) ? 'disabled' : ((value.STATUS == 4) ? 'disabled' : '')) + 
                                var tdClass = ((value.STATUS == 1) ? 'statusClsSch' : ((value.STATUS == 2) ? 'statusClsOngoing' : ((value.STATUS == 3) ? 'statusClsCanceled' : 'statusClsCompleted')));
                                trainingData += `<tr>
                                                    <td>` + i + `</td>
                                                    <td>` + value.MODULE_NAME + `(` + value.NO_OF_SESSIONS + `)</td>
                                                    <td>` + value.TRAINING_TITLE + `</td>
                                                    <td class='` + tdClass + `'>` + value.STATUSTEXT + `</td>
                                                    <td>` + value.TRAINING_START_DATE + `</td>
                                                    <td>` + planned + `</td>
                                                    <td>` + actual + `</td>
                                                    <td>` + ((planned == 0) ? (0.00) : (parseFloat((actual / planned) * 100).toFixed(2))) + `</td>
                                                    <td>` + ((value.LEARNING_INDEX) ? parseFloat(value.LEARNING_INDEX).toFixed(2) : 0) + `</td>
                                                    <td>` + parseFloat(value.COURSE_AVERAGE_RATING).toFixed(2) + `</td>
                                                    <td>` + parseFloat(value.FACULTY_AVERAGE_RATING).toFixed(2) + `</td>
                                                    <td><a class='btn btn-icon-only btn-xs btn-info' title='View Training'  onclick='viewTraining(` + value.TRAINING_ID + `,` + value.STATUS + `);'> <i class='fa fa-eye'></i> </a></td>
                                                 </tr>`;
                            }
                        } else {
                            var value = value1['TrainingDetail'];
                            var planned = 0;
                            if (value1['Employees'].hasOwnProperty('scheduled') && value1['Employees']['scheduled'][0] != null) {
                                planned += ((value1['Employees']['scheduled']).length);
                            } else {
                                planned += ((value1['Employees'].hasOwnProperty('present')) ? ((value1['Employees']['present']).length) : 0) + ((value1['Employees'].hasOwnProperty('absent')) ? ((value1['Employees']['absent']).length) : 0);
                            }
                            var actual = 0;
                            if (value1['Employees'].hasOwnProperty('present')) {
                                actual = (value1['Employees']['present']).length;
                            }
                            var trainingDate = new Date(value.TRAINING_START_DATE);
                            var dis = (now.getTime() <= trainingDate.getTime() || value.STATUS == 4) ? 'disabled' : ''; // + ((value.SCHEDULESTATUS == 0) ? 'disabled' : ((value.STATUS == 4) ? 'disabled' : '')) + 
                            var tdClass = ((value.STATUS == 1) ? 'statusClsSch' : ((value.STATUS == 2) ? 'statusClsOngoing' : ((value.STATUS == 3) ? 'statusClsCanceled' : 'statusClsCompleted')));
                            trainingData += `<tr>
                                                <td>` + i + `</td>
                                                <td>` + value.MODULE_NAME + `(` + value.NO_OF_SESSIONS + `)</td>
                                                <td>` + value.TRAINING_TITLE + `</td>
                                                <td class='` + tdClass + `'>` + value.STATUSTEXT + `</td>
                                                <td>` + value.TRAINING_START_DATE + `</td>
                                                <td>` + planned + `</td>
                                                <td>` + actual + `</td>
                                                <td>` + ((planned == 0) ? (0.00) : (parseFloat((actual / planned) * 100).toFixed(2))) + `</td>
                                                <td>` + ((value.LEARNING_INDEX) ? parseFloat(value.LEARNING_INDEX).toFixed(2) : 0) + `</td>
                                                <td>` + parseFloat(value.COURSE_AVERAGE_RATING).toFixed(2) + `</td>
                                                <td>` + parseFloat(value.FACULTY_AVERAGE_RATING).toFixed(2) + `</td>
                                                <td><a class='btn btn-icon-only btn-xs btn-info' title='View Training'  onclick='viewTraining(` + value.TRAINING_ID + `,` + value.STATUS + `);'> <i class='fa fa-eye'></i> </a></td>
                                            </tr>`;
                        }
                        i++;
                    });
                } else {
                    trainingData += "<tr><td colspan=12><b>No training Found</b></td></tr>";
                }
                $("#newEmployeelist tbody").html(trainingData);
                if (!$.fn.dataTable.isDataTable('#newEmployeelist')) {
//                    var table = $('#newEmployeelist').DataTable({
////                        'paging': true,
////                        'searching': false,
////                        'ordering': false,
////                        'autoWidth': true,
////                        fixedHeader: true,
////                        responsive: true,
////                        fixedHeader: {
////                            header: true,
////                            footer: true
////                        }
//                    });
//                    new $.fn.dataTable.FixedHeader(table);
                }
            });
}
function listVanue(training_type) {
    var venueoption = '<option value="">Select Venue</option>';
    $.ajax({
        url: URL,
        global: false,
        type: 'POST',
        data: {act: 'fillVenue', data: training_type},
        async: false, //blocks window close
        success: function (res) {
            var venueList = $.parseJSON(res);
            $.each(venueList, function (key, value) {
                venueoption += "<option value=" + value.ID + ">" + value.VENUE_NAME + "</option>"
            });
            $(".venueList").html(venueoption);
        }
    });
}

function genSessionNo(i) {
    $("h4#sessionName").each(function () {
        $(this).html("<i class='fa fa-calendar-check-o'></i> Training Session " + (i));
        i++;
    });
}

function changeModule(module_id) {
    if ($("#trainingModule_id").val() != '') {
        $("#trainingModule_id").removeClass('has-error');
    }
    var checkedTrainingCategory = $("#ScheduleForm input[name=training_category]:checked").val();
    if (checkedTrainingCategory == 2) {    // 2 stands for normal training category
        $.ajax({
            url: URL,
            global: false,
            type: 'POST',
            data: {act: 'getUserListforSch', data: module_id},
            async: false, //blocks window close
            success: function (res) {
                var result = res.split("|");
                $("#multiselect").html(result[0]);
                $(".schTrainingEmployee").html("");
                $(".trainers").html(result[1]);
            }
        });
    } else if (checkedTrainingCategory == 1) {   //2 stands for master training category
//    if ($('#master_training').iCheck('update')[0].checked) {
//    if (masterchecked) {
        $.ajax({
            url: URL,
            global: false,
            type: 'POST',
            data: {act: 'getTrainerListforSch', module_id: module_id},
            async: false, //blocks window close
            success: function (res) {
                var result = res.split("|");
                $("#multiselect").html(result[0]);
//                alert($("#multiselect").html());
                $(".schTrainingEmployee").html("");
                $(".trainers").html(result[1]);
            }
        });
    }
//    $('#normal_training').on('ifChecked', function (event) {

//    });
}
function saveScheduledData() {
    var selectedUserID = [];
    $('#multiselect_to option').map(function () {
        selectedUserID.push({'emp_id': $(this).val(), tni_id: $(this).data('tniid')});
    });
    if (schedulingValidate(selectedUserID)) {
        if ($("#training_id").val() == '') {
            addEditTrainingSch(selectedUserID);
        } else {
            $.post(URL, {
                act: 'updateTrainingData',
                data: $("#training_id").val(),
            },
                    function (res) {
                        var result = $.parseJSON(res);
                        if (result.status == 1) {
                            addEditTrainingSch(selectedUserID);
                            swal("Updated!", "Training scheduling has been updated Successfully", "success");
                        } else {
                            swal("Error!", "Training Scheduling can't be updated!!", "warning");
                        }
                        $("#ScheduleForm").closest('form').find("input[type=text], textarea, select").val("");
                    });
        }
    }
}
function addEditTrainingSch(selectedUserID) {
    $('.someBlock').preloader();
    var selectedTniID = [];
    $.post(URL, {
        act: 'saveTrainingDetails',
        data: $("#ScheduleForm").serialize(),
        schEmp: selectedUserID
    },
            function (res) {
                var result = $.parseJSON(res);
                if (result.status == 1) {
                    $("#scheduleModal").modal('hide');
                    $(".modal-backdrop").removeClass('modal-backdrop fade in');
//                    searchTrainingData();
//                    getCalenderData();
                    openUrl(this, "TrainingControl/training_calender.php");
                    $("#ScheduleForm").closest('form').find("input[type=text], textarea, select").val("");
                }
            });
}
function cancelTraining(training_id) {
    swal({
        title: 'Do you really want to cancel this training??',
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, I am sure!',
        cancelButtonText: "No, cancel it!",
        closeOnConfirm: true,
        closeOnCancel: true
    },
            function (isConfirm) {
                if (isConfirm) {
                    $.post(URL, {
                        act: 'cancelSchedule',
                        data: training_id
                    },
                            function (res) {
                                var result = $.parseJSON(res);
                                if (result.status == 1) {
//                                    searchTrainingData();
                                    openUrl(this, "TrainingControl/training_calender.php");
                                } else {
                                    swal("Error!", "Server error,Please try again later", "warning");
                                }
                            });
                }
            });
}
function editTraining(training_id) {
    trainingSchedule();
    $.post(URL, {
        act: 'editSchedule',
        data: training_id
    },
            function (res) {
                var result = $.parseJSON(res);
                changeModule(result.module_id);
                $("#training_id").val(result.training_id);
                $("#trainingModule").html("<label class='form-control'>" + result.moduleNM + "</label>");
                $("#trainingModule_id").val(result.module_id);
                $("#training_title").val(result.training_title);
                if (result.training_category == 1) {
                    $('#master_training').iCheck('check');
                    $('#normal_training').iCheck('disable');
                } else if (result.training_category == 2) {
                    $('#normal_training').iCheck('check');
                    $('#master_training').iCheck('disable');
                }
                var training_type = (result.training_type == 'External') ? 2 : 1;
                $("input[name=training_type][value=" + training_type + "]").attr('checked', true);
                listVanue(training_type);
                var remoptions = '';
                var count = 0;
                if (result.training_category == 2) {
                    if (!$.isEmptyObject(result.remaining_emp)) {
                        $.each(result.remaining_emp, function (key, val) {
                            remoptions += '<option value=' + val.ID + ' data-tniid=' + val.TNI_ID + '>' + val.USER_NAME + '(' + val.ID + ')</option>';
                            count = key;
                        });
                    }
                    $("#multiselect").html(remoptions);
                }
                $("#leftlebel").text('Nominated Employees(' + count + ')');
                var schoptions = '';
                var count = 0;
                $.each(result.scheduled, function (key, val) {
                    schoptions += '<option value=' + val.EMP_ID + ' data-tniid=' + val.TNI_ID + '>' + val.USER_NAME + '(' + val.EMP_ID + ')</option>';
                    count = key;
                });
                $("#rightlebel").text('Scheduled Employees(' + count + ')');
                $("#multiselect_to").html(schoptions);
                var i = 0;
                $.each(result.sessionVal, function (k, v) {
                    i++;
                    (i > 1) ? $(".plusCls").trigger('click') : '';
                    $("input[name='session_desc[]']").eq(k).val(v.session_desc);
                    $("select[name='SchTrainingVanue[]']").eq(k).val(v.venue_id);
                    $("select[name='SchTrainer[]']").eq(k).val(v.trainer);
                    $("input[name='SchDate[]']").eq(k).val(v.training_sch_date);
                    $("input[name='SchFromTime[]']").eq(k).val(v.session_start_time);
                    $("input[name='SchToTime[]']").eq(k).val(v.session_end_time);
                });
//                    $('.sessionId').slice(i).remove();
            });
}
function viewTraining(training_id, training_status) {
    $("#addMoresection").remove();

    $("button[name='scheduleBtn']").remove();
    $("input[name=training_type]").removeAttr('onchange');
    $("#addremovemployee").html('');
    if (training_status == 1) {
        $("#leftlebel").text("Nominated Employees");
        $("#rightlebel").text("Scheduled Employees");
    } else {
        $("#leftlebel").text("Present Employees");
        $("#rightlebel").text("Absent Employees");
    }
    trainingSchedule();
    $.post(URL, {
        act: 'editSchedule',
        data: training_id
    }, function (res) {
        var result = $.parseJSON(res);
        changeModule(result.module_id);
        $("#training_id").val(result.training_id);
        $("#trainingModule").html("<label class='form-control'>" + result.moduleNM + "</label>");
        $("#trainingModule_id").val(result.module_id);
        $("#training_title").val(result.training_title);
        if (result.training_category == 2) {
            $("#master_training").iCheck('disable');
            $("#normal_training").iCheck('check');
        } else {
            $("#master_training").iCheck('check');
            $("#normal_training").iCheck('disable');
        }
        if (result.training_type == 'Internal') {
            $("#internal_training").iCheck('check');
        } else {
            $("#external_training").iCheck('check');
        }
        var remoptions = '';
//                if (!$.isEmptyObject(result.remaining_emp)) {
//                    $.each(result.remaining_emp, function (key, val) {
//                        remoptions += '<option value=' + val.ID + ' data-tniid=' + val.TNI_ID + '>' + val.USER_NAME + '(' + val.ID + ')</option>';
//                    });
//                }

        var schoptions = '';
        $.each(result.scheduled, function (key, val) {
            if (val.ATTENDANCE == '1') {
                remoptions += '<option value=' + val.EMP_ID + ' data-tniid=' + val.TNI_ID + '>' + val.USER_NAME + '(' + val.EMP_ID + ')</option>';
            } else {
                schoptions += '<option value=' + val.EMP_ID + ' data-tniid=' + val.TNI_ID + '>' + val.USER_NAME + '(' + val.EMP_ID + ')</option>';
            }
        });
        $("#multiselect").html(remoptions);
        $("#multiselect_to").html(schoptions);
        var i = 0;
        $.each(result.sessionVal, function (k, v) {
            i++;
            (i >= 1) ? $(".plusCls").trigger('click') : '';
            $("input[name='session_desc[]']").eq(k).val(v.session_desc);
            $("select[name='SchTrainingVanue[]']").eq(k).val(v.venue_id);
            $("select[name='SchTrainer[]']").eq(k).val(v.trainer);
            $("input[name='SchDate[]']").eq(k).val(v.training_sch_date);
            $("input[name='SchFromTime[]']").eq(k).val(v.session_start_time);
            $("input[name='SchToTime[]']").eq(k).val(v.session_end_time);
        });
        $(".plusButton").hide();
        $(".form-control").removeClass("has-error");
        $(".sessionBtnClose").hide();
        $("#validatinNotice").hide();
    });
}

function schValidation() {
    if ($("#training_title").val() == '') {
        $("#training_title").parent().addClass('has-error');
        return 0;
    } else {
        return 1;
    }
}


function schedulingValidate(selectedUserID) {
    if ($("#trainingModule_id").val() == '') {
        $("#trainingModule_id").addClass('has-error');
        return false;
    } else {
        $("#trainingModule_id").removeClass('has-error');
    }
    if ($("#training_title").val() == '') {
        $("#training_title").addClass('has-error');
        return false;
    } else {
        $("#training_title").removeClass('has-error');
    }
//    if ($.isEmptyObject(selectedUserID)) {
//        $("#multiselect_to").addClass('has-error');
//        return false;
//    } else {
//        $("#multiselect_to").removeClass('has-error');
//    }

    var length = $(".sessionId").length;
    if (sessionValidation(length - 2)) {
        return true;
    } else {
        return false;
    }
}

function sessionValidation(i) {
    for (var count = 0; count <= i; count++) {
        var session_desc = $("input[name='session_desc[]']").eq(count).val();
        var SchTrainingVanue = $("select[name='SchTrainingVanue[]']").eq(count).val();
        var SchTrainer = $("select[name='SchTrainer[]']").eq(count).val();
        var SchDate = $("input[name='SchDate[]']").eq(count).val();
        var SchFromTime = $("input[name='SchFromTime[]']").eq(count).val();
        var SchToTime = $("input[name='SchToTime[]']").eq(count).val();
        if (session_desc == '') {
            $("input[name='session_desc[]']").eq(count).addClass('has-error');
            return false;
        } else {
            $("input[name='session_desc[]']").eq(count).removeClass('has-error');
        }
        if (SchTrainingVanue == '') {
            $("select[name='SchTrainingVanue[]']").eq(count).addClass('has-error');
            return false;
        } else {
            $("select[name='SchTrainingVanue[]']").eq(count).removeClass('has-error');
        }
        if (SchTrainer == '') {
            $("select[name='SchTrainer[]']").eq(count).addClass('has-error');
            return false;
        } else {
            $("select[name='SchTrainer[]']").eq(count).removeClass('has-error');
        }
        if (SchDate == '') {
            $("input[name='SchDate[]']").eq(count).addClass('has-error');
            return false;
        } else {
            $("input[name='SchDate[]']").eq(count).removeClass('has-error');
        }
        if (SchFromTime == '') {
            $("input[name='SchFromTime[]']").eq(count).addClass('has-error');
            return false;
        } else {
            $("input[name='SchFromTime[]']").eq(count).removeClass('has-error');
        }
        if (SchToTime == '') {
            $("input[name='SchToTime[]']").eq(count).addClass('has-error');
            return false;
        } else {
            $("input[name='SchToTime[]']").eq(count).removeClass('has-error');
        }
    }
    return true;
}