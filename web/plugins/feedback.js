$(function () {
    $('#uploadbtnId').off().on('change', '#file-upload', prepareUpload);
});
function feedbackUpdate(training_id, empid) {
    $("#feedbackModal").modal('show');
    $('#training_id').val(training_id);
    $.post(URL, {
        act: 'editSchedule',
        data: training_id
    },
            function (res) {
                var result = $.parseJSON(res);
                var options = '';
                $("#program_title").val(result.moduleNM);
//                console.log(result.scheduled);
                var count = 0;
                $.each(result.scheduled, function (key, val) {
                    if ((empid == '' || empid == val.EMP_ID) && val.ATTENDANCE == 1) {
                        count++;
                        options += "<option value=" + val.EMP_ID + " data-tniid=" + val.TNI_ID + ">" + val.USER_NAME + "(" + val.EMP_ID + ")<i class=" + "'" + "fa fa-file-text-o" + "'" + "></i></options>"
                    }
                });
                if (count == 0) {
                    options = "<option value='' >No Employees Scheduled<i class=" + "'" + "fa fa-file-text-o" + "'" + "></i></options>"
                }
                $("#employee_id").html(options);
                $("#training_date").val(result.sessionVal[0].training_sch_date);
                var faculty = $("#facultyID").clone();
                $('.facultyCls').remove();
                var i = 0;
                var venue = '';
                var faculty = '';
                var Result = new Array();
                $.ajax({
                    url: URL2,
                    global: false,
                    type: 'POST',
                    data: {act: 'feedbackSearch'},
                    async: false, //blocks window close
                    success: function (res) {
                        Result = JSON.parse(res);
                    }
                });
                var trainer_id = [];
                $.each(result.sessionVal, function (key, val) {
                    if ($.inArray(val.trainer, trainer_id) == -1) {
                        venue += val.venue_name + ',';
                        faculty += `<tr >
                                            <td ></td>
                                            <td colspan="2">Strongly Disagree</td>
                                            <td colspan="2">Strongly Agree</td>
                                        </tr>
                                        <tr>
                                            <td style="font-size: 20px">` + val.trainer_name + `</td>
                                            <td>1</td>
                                            <td>2</td>
                                            <td>3</td>
                                            <td>4</td>
                                        </tr>`;
                        var feedback = '';
                        $.each(Result, function (k, v) {
                            if (v.TYPE == 2) {
                                feedback += `<tr style="line-height: 20px;">
                                                    <td width="50%">` + v.QUESTION + `</td>
                                                    <td><label><input type="radio" value="1" name="` + val.trainer + `feedback` + v.ID + `" class="minimal"></label></td>
                                                    <td><label><input type="radio" value="2" name="` + val.trainer + `feedback` + v.ID + `" class="minimal"></label></td>
                                                    <td><label><input type="radio" value="3" name="` + val.trainer + `feedback` + v.ID + `" class="minimal"></label></td>
                                                    <td><label><input type="radio" value="4" name="` + val.trainer + `feedback` + v.ID + `" class="minimal"></label></td>
                                             </tr>`;
                            }
                        });
                        faculty += feedback;
                        trainer_id.push(val.trainer);
                    }
                });
                $(".facultyFeedbackDiv").append('<table width="100%" class="question facultyCls" id="facultyID">' + faculty + '</table>');
                $('input[type="radio"].minimal').iCheck({
                    radioClass: 'iradio_minimal-blue'
                });
                venue = venue.substring(0, venue.lastIndexOf(","));
                $("#venue_name").val(venue);
                getFeedback($("#employee_id").val());
            });
}

function getFeedback(employee_id) {
    var training_id = $('#training_id').val();
    $.post(URL2, {
        act: 'getFeedback',
        data: {'empid': employee_id, 'training_id': training_id}
    },
            function (result) {
                if (!$.isEmptyObject(result)) {
                    $("input:radio").attr('checked', false);
                    $("input:radio").parent().removeClass("checked");
                    $("input:radio").parent().attr("aria-checked", false);
                    $.each(result, function (key, val) {
                        if (val.TYPE == 1) {
                            $("input[name='feedback" + val.FEEDBACK_QN + "'][value=" + val.ANSWER + "]").iCheck('check');
                        } else if (val.TYPE == 2) {
                            $("input[name='" + val.FEEDBACK_FOR + "feedback" + val.FEEDBACK_QN + "'][value=" + val.ANSWER + "]").iCheck('check');
                        } else if (val.TYPE == 3) {
                            $("#subFeedback" + val.FEEDBACK_QN).val(val.ANSWER);
                        }
                    });
                } else {
                    $("input:radio").parent().removeClass("checked");
                    $("input:radio").parent().attr("aria-checked", false);
                    $("textarea").val('');
                }
            }, 'JSON');
}

function feedbackSave() {
    $.post(URL2, {
        act: 'saveFeedback',
        data: $("#feedbackForm").serialize(),
        training_id: $('#training_id').val(),
        employee_id: $("#employee_id").val()
    },
            function (res) {
                var result = JSON.parse(res);
                if (result.status == 1) {
                    swal("Success!", result.msg, "success");
                }
            });
}

function prepareUpload() {
    var files = event.target.files;
    var formData = new FormData();
    $.each(files, function (key, value) {
        formData.append(key, value);
    });
    formData.append('trainingId', $("#training_id").val());
    formData.append('employee_id', $("#employee_id").val());
    var xhr = new XMLHttpRequest();
    xhr.open('POST', URL, true);
    xhr.send(formData);
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if (!$.isEmptyObject(data)) {
                if (data.status == 1) {
                    move();
                } else {
                    swal("Error!", data.msg, "warning");
                }
            }
        } else {
            alert('An error occurred!');
        }
    };
}

function removeUploadedfile() {

}

function move() {
    var elem = document.getElementById("myBar1");
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
        $("#progress_percentage1").text(width + '%');
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}