
// 是否生成过代码
var isGenerated = false;

// 任务类型和模型列表,需要实时更新
var modelList = {
    "classification": ["LeNet", "ResNet18", "ResNet50", "MobileNet"],
    "detection": ["Yolov3", "SSD_Lite", "FasterRCNN"],
}



// 图表配置
var lossOption = {
    title: {
        text: 'Loss Chart'
    },
    tooltip: {},
    legend: {
        data: ['loss']
    },
    xAxis: {
        data: [],
        name: 'epoch',

    },
    yAxis: {
        name: 'loss',
    },
    series: [{
        name: 'loss',
        type: 'line',
        smooth: true,
        data: []
    }],
    grid:{
        x2:80
    }  
};

var accOption = {
    title: {
        text: 'Accuracy Chart'
    },
    tooltip: {},
    legend: {
        data: ['accuracy']
    },
    xAxis: {
        data: [],
        name: 'epoch',
    },
    yAxis: {
        name: 'accuracy',
    },
    series: [{
        name: 'accuracy',
        type: 'line',
        smooth: true,
        data: []
    }],
    grid:{
        x2:80
    }  
};

var lossChart = echarts.init(document.getElementById('loss-chart'));
var accChart = echarts.init(document.getElementById('acc-chart'));

document.addEventListener('DOMContentLoaded', function () {


    // window.onresize = function () {
    //     window_height = document.documentElement.clientHeight;
    //     window_width = document.documentElement.clientWidth;
    //     console.log("height", window_height);
    //     console.log("width", window_width);

    //     // 根据屏幕大小调整accChart和lossChart的大小
    //     if (window_width > 1212) {
    //         // 调大accChart和lossChart的宽度
    //         accChart.resize({ width: 550 });
    //         lossChart.resize({ width: 550 });
    //     }
    // }


    // 选择任务类型
    document.getElementById('task-submit-btn').addEventListener('click', function () {
        // 获取选中的任务类型
        var selectedTask = document.getElementById('task-select').value;
        // 构建请求数据
        var requestData = {
            task: selectedTask
        };
        // 发送POST请求到Flask后端
        fetch('/mmedu/select_task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                // 处理成功响应
                console.log(data);
                // 在这里可以执行其他操作，例如更新页面内容
            })
            .catch(error => {
                // 处理错误
                console.error(error);
            });
        updateCarouselContent(selectedTask, null, null);

        if (selectedTask == 'classification') {
            var modelSelect = document.getElementById('model-select');
            modelSelect.innerHTML = '';
            for (var i = 0; i < modelList['classification'].length; i++) {
                var option = document.createElement("option");
                option.text = modelList['classification'][i];
                option.value = modelList['classification'][i];
                modelSelect.appendChild(option);
            }
        }
        else if (selectedTask == 'detection') {
            var modelSelect = document.getElementById('model-select');
            modelSelect.innerHTML = '';
            for (var i = 0; i < modelList['detection'].length; i++) {
                var option = document.createElement("option");
                option.text = modelList['detection'][i];
                option.value = modelList['detection'][i];
                modelSelect.appendChild(option);
            }
        }
        // 现在，您可以在JavaScript代码中使用modelList
        console.log(modelList);
        // 跳到下一个轮播项
        nextCarouselItem();


    });


});
// 选择模型
document.getElementById('model-submit-btn').addEventListener('click', function () {
    // 获取选中的任务类型
    var selectedModel = document.getElementById('model-select').value;
    // 构建请求数据
    var requestData = {
        model: selectedModel
    };
    // 发送POST请求到Flask后端
    fetch('/mmedu/select_model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功响应
            console.log(data);
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });

    updateCarouselContent(null, selectedModel, null);
    // 跳到下一个轮播项
    nextCarouselItem();

});


// 更新轮播项的内容
function updateCarouselContent(task, model, dataset) {

    var subtitleTasks = document.getElementsByClassName('subtitle-task');
    var subtitleModels = document.getElementsByClassName('subtitle-model');
    var subtitleDatasets = document.getElementsByClassName('subtitle-dataset');

    if (task != null) {
        for (var i = 0; i < subtitleTasks.length; i++) {
            if(task=="classification"){
                subtitleTasks[i].textContent = "已选择的任务类型：分类任务" ;
            }
            else if(task=="detection"){
                subtitleTasks[i].textContent = "已选择的任务类型：检测任务" ;
            }
        }

    }
    if (model != null) {
        for (var i = 0; i < subtitleModels.length; i++) {
            subtitleModels[i].textContent = "已选择的模型：" + model;
        }
    }
    if (dataset != null) {
        for (var i = 0; i < subtitleDatasets.length; i++) {
            subtitleDatasets[i].textContent = "已选择的数据集：" + dataset;
        }
    }
}

// 在页面渲染时，获取本地数据集
// 在跳转到第三个轮播项时，获取本地数据集

// 监听跳转到第三个页面：
$(document).ready(function () {
    $('#myCarousel').on('slid.bs.carousel', function () {
        var currentIndex = $('#myCarousel .active').index();
        if (currentIndex == 2) {
            fetch('/mmedu/get_local_dataset')
                .then(response => response.json())
                .then(data => {
                    // 处理成功响应
                    console.log(data);
                    // 在第三个轮播项中显示数据集列表
                    // 获取data中的key
                    var keys = Object.keys(data);
                    console.log(keys); // ["cls", "det"] 但是这里的key和任务不一致，一个是简写一个是全称
                    // 获取选中的任务类型
                    var selectedTask = document.getElementById('task-select').value;
                    var dataSetSelect = document.getElementById('dataset-select')
                    // 如果任务是分类，显示分类数据集列表
                    if (selectedTask == "classification") {
                        dataSetSelect.innerHTML = '';
                        for (var i = 0; i < data['cls'].length; i++) {
                            var option = document.createElement("option");
                            option.text = data['cls'][i];
                            path = data['cls'][i];
                            // replace / with \\
                            path = path.replace(/\//g, '\\');
                            // 设置为最后一个\\后面的字符串
                            option.value = path.split('\\').pop();
                            dataSetSelect.appendChild(option);
                        }
                    }
                    // 如果任务是检测，显示检测数据集列表
                    else if (selectedTask == "detection") {
                        dataSetSelect.innerHTML = '';
                        for (var i = 0; i < data['det'].length; i++) {
                            var option = document.createElement("option");
                            option.text = data['det'][i];
                            path = data['det'][i];
                            // replace / with \\
                            path = path.replace(/\//g, '\\');
                            // 设置为最后一个\\后面的字符串
                            option.value = path.split('\\').pop();
                            dataSetSelect.appendChild(option);
                        }
                    }
                })
                .catch(error => {
                    // 处理错误
                    console.error(error);
                });
        }

        else if (currentIndex == 0) {
            var selectedModel = document.getElementById('model-select').value;
            updateCarouselContent(null, selectedModel, null);
        }
        else if (currentIndex == 1) {
            var selectedTask = document.getElementById('task-select').value;
            updateCarouselContent(selectedTask, null, null);
        }
    });
});


// 选择数据集
document.getElementById('dataset-submit-btn').addEventListener('click', function () {
    // 获取选中的任务类型
    var selectedDataset = document.getElementById('dataset-select').value;
    // 构建请求数据
    var requestData = {
        dataset: selectedDataset
    };
    // 发送POST请求到Flask后端
    fetch('/mmedu/select_dataset', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功响应
            console.log(data);
            // 在这里可以执行其他操作，例如更新页面内容
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
    updateCarouselContent(null, null, selectedDataset);
    // 跳到下一个轮播项
    nextCarouselItem();

});

// 点击生成代码
document.getElementById('code-generate-btn').addEventListener('click', function () {
    // 发送POST请求到Flask后端
    fetch('/mmedu/get_code', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功响应
            console.log(data);
            isGenerated = true;
            // 在code标签中显示代码
            var code = document.getElementsByTagName('code')[0];
            code.innerHTML = data;
            // 渲染高亮
            hljs.highlightBlock(code);
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
});

    // 给goto-train-btn绑定事件，点击跳转到训练页面
    document.getElementById('goto-train-btn').addEventListener('click', function () {
        nextCarouselItem();
    });

// 点击复制代码到剪贴板
$(function () { $("[data-toggle='tooltip']").tooltip(); });
function copyCode2Clipboard() {
    var clipboard = new ClipboardJS('#code-copy-btn');

    var clipbtn = document.getElementById('code-copy-btn');

    clipboard.on('success', function (e) {
        // alert("代码已经复制到剪贴板!");
        e.clearSelection();
        // clipbtn.setAttribute('title','copy to clipboard');
        $('#code-copy-btn').tooltip('show')

        setTimeout(function () {
            $('#code-copy-btn').tooltip('hide')
        }, 1000);


    });
}

copyCode2Clipboard();


// 表单提交
document.getElementById("train_cfg_form").addEventListener("submit", function (event) {
    event.preventDefault();

    var formData = new FormData(this);

    fetch('/mmedu/set_base_cfg', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功响应
            console.log(data);
            // 在这里可以执行其他操作，例如更新页面内容

        })
        .catch(error => {
            // 处理错误
            console.error(error);
        })

});

// 获取id为cfgAdvanceSet div中的内容,并提交数据到后端
document.getElementById("advset-submit-btn").addEventListener("click", function (event) {
    event.preventDefault();
    var classNum = document.getElementById("classNum").value;
    var optimizerSelect = document.getElementById("optimizer-select");
    var optimizer = optimizerSelect.options[optimizerSelect.selectedIndex].value;
    var weightDecay = document.getElementById("weight-decay").value;
    var deviceSelect = document.getElementById("device-select");
    var device = deviceSelect.options[deviceSelect.selectedIndex].value;
    var pretrainedSelect = document.getElementById("pretrained-select");
    var pretrained = pretrainedSelect.options[pretrainedSelect.selectedIndex].value;

    if (pretrained == "custom") {
        pretrained = document.getElementById("custom-pretrained-model").value;
        // 如果自定义的预训练模型为空，就报错
        if (pretrained == "") {
            alert("请输入自定义的预训练模型路径!");
            return;
        }
        // 如果不是以.pth结尾，就报错
        if (pretrained.slice(-4) != ".pth") {
            alert("自定义的预训练模型必须是.pth文件!");
            return;
        }
    }

    var requestData = {
        "class_num": classNum,
        "optimizer": optimizer,
        "weight_decay": weightDecay,
        "device": device,
        "pretrained_model": pretrained
    };
    console.log(requestData);
    fetch('/mmedu/set_advance_cfg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功响应
            console.log(data);
            // 关闭模态框
            $('#cfgModal').modal('hide');
            // 在这里可以执行其他操作，例如更新页面内容
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });

});




// 函数：点击跳转到下一轮播项
function nextCarouselItem() {
    $('.carousel').carousel('next');
}

// 绑定到关闭按钮
// document.getElementById('btn-modal-close').addEventListener('click', nextCarouselItem);
// document.getElementById('dataset-submit-btn').addEventListener('click', nextCarouselItem);
// document.getElementById('model-submit-btn').addEventListener('click', nextCarouselItem);


var total_log_data = [];

// 点击开始训练按钮，发送请求到后端
document.getElementById('start-train-btn').addEventListener('click', function () {
    if (!isGenerated) {
        alert("请先生成代码!");
        return;
    }
    get_epoch();
    // 构建请求数据
    // 发送POST请求到Flask后端
    fetch('/mmedu/start_thread', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })

    // 按钮被禁用
    document.getElementById('start-train-btn').disabled = true;

    clearTrainProgressBar();
    poll_log();
});

// 点击结束训练按钮，发送请求到后端
document.getElementById('stop-train-btn').addEventListener('click', function () {
    fetch('/mmedu/stop_thread', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // 训练按钮被启用
            document.getElementById('start-train-btn').disabled = false;

            // 停止轮询
            // clearInterval(intervalId);
            lossChart.hideLoading();
            accChart.hideLoading();
            if (data.success) {
                $('#trainTerminateModal').modal('show');
            }
            else {
                // trainTerminateModal = document.getElementById('trainTerminateModal');
                // body = trainTerminateModal.getElementsByClassName("modal-body")[0];
                // p = body.getElementsByTagName("p")[0];
                // p.innerHTML = data.message;
                // // 设置自动换行
                // p.style.wordWrap = "break-word";
                $('#trainTerminateModal').modal('show');
            }
        });
});

document.getElementById('finish-train-btn').addEventListener('click', function () {
    // 弹出convertModal
    $('#trainFinishModal').modal('hide');
    $('#convertModal').modal('show');
});


document.getElementById('finish-train-btn2').addEventListener('click', function () {
    // 弹出convertModal
    $('#trainFinishModal').modal('hide');
    $('#convertModal').modal('show');
});

document.getElementById('convert-btn').addEventListener('click', function () {

    // 显示转换中的模态框
    $('#convertModal').modal('hide');
    $('#convertLoadingModal').modal('show');
    fetch('/mmedu/convert_model', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                $('#convertLoadingModal').modal('hide');
                convertFinishModal = document.getElementById('convertFinishModal');
                body = convertFinishModal.getElementsByClassName("modal-body")[0];
                p = body.getElementsByTagName("p")[0];
                p.innerHTML = data.message + ",转换后的模型保存路径为:" + data.onnxpath;
                // 设置自动换行
                p.style.wordWrap = "break-word";
                $('#convertFinishModal').modal('show');
            }
            else {
                convertFinishModal = document.getElementById('convertFinishModal');
                body = convertFinishModal.getElementsByClassName("modal-body")[0];
                p = body.getElementsByTagName("p")[0];
                p.innerHTML = data.message
                // 设置自动换行
                p.style.wordWrap = "break-word";
                $('#convertFinishModal').modal('show');
            }
        });
    });


// 轮询线程状态
function pollThreadStatus() {
    fetch('/mmedu/get_message', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            // 处理成功响应
            console.log(data);
            // 如果跟上一次的数据不一致，就加入
            if (total_log_data.length == 0 || total_log_data[total_log_data.length - 1] != data) {
                total_log_data.push(data);
            }
        })
        .catch(error => {
            // 处理错误
            console.error(error);
        });
}



var G_totalEpoch = 0;
var G_checkpoints_path = "";

function get_epoch() {
    // 从后端获取总epoch
    fetch('/mmedu/get_epoch', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            G_totalEpoch = data['epoch'];
        });
}




function get_checkpoints_path() {

    var checkpoints_path = "";
    // 从后端获取checkpoints_path
    fetch('/mmedu/get_checkpoints_path', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            checkpoints_path = data['checkpoints_path'];
            setTrainFinishModal(checkpoints_path);
        }
        );

    return checkpoints_path;
}



// console.log(G_checkpoints_path);
const socket = io.connect('http://localhost:5000');
function poll_log() {
    // 连接socket

    lossList = []
    accList = []
    currentEpoch = 1
    temp_loss = [];

    // 清除图表数据
    lossOption.series[0].data = [];
    accOption.series[0].data = [];

    // chart的加载动画
    lossChart.showLoading();
    accChart.showLoading();

    flag = true;
    socket.on('log', (log) => {
        // console.log(log);
        if (flag) {
            lossChart.hideLoading();
            accChart.hideLoading();
            // 显示图表的坐标轴
            lossChart.setOption(lossOption);
            accChart.setOption(accOption);
            flag = false;
        }



        // 如果跟上一次的数据不一致，就加入
        if (total_log_data.length == 0 || total_log_data[total_log_data.length - 1] != log) {
            total_log_data.push(log);
            logJsno = JSON.parse(log);

            // 获取logJson中的所有key
            var keys = Object.keys(logJsno);
            if ("accuracy_top-1" in logJsno) {
                epoch = logJsno['epoch'];
                mode = logJsno['mode'];
                loss = logJsno['loss'];
                acc = logJsno['accuracy_top-1']; // 不一定是top-1
            }
            else {
                epoch = logJsno['epoch'];
                mode = logJsno['mode'];
                loss = logJsno['loss'];
                acc = logJsno['accuracy_top-5'];
            }


            if (mode == "train" && epoch == currentEpoch) {
                temp_loss.push(loss);
                console.log(loss)
            }
            else if (mode == "val" && epoch == currentEpoch) {
                accList.push(acc)
                console.log("accList", acc);
                console.log("temp_loss", temp_loss);
                // 求temp_loss的平均值
                var sum = 0;
                for (var i = 0; i < temp_loss.length; i++) {
                    sum += temp_loss[i];
                }
                var avgLoss = sum / temp_loss.length;
                // 设置进度条
                setTrainProgressBar(epoch);
                // 更新图表
                lossOption.series[0].data.push(avgLoss);
                lossChart.setOption(lossOption);
                accOption.series[0].data.push(acc);
                accChart.setOption(accOption);

                console.log("avgloss", avgLoss);
                // 清空temp_loss
                temp_loss = [];
                lossList.push(avgLoss);
                currentEpoch += 1
            }

            if (mode == "val" && epoch == G_totalEpoch) { // 这段代码逻辑有点问题，其实不应该发请求
                // console.log("应该停止训练模型了");
                // fetch('/mmedu/stop_thread', {
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                // })
                // .then(response => response.json())
                // .then(data => {
                //     console.log(data);                
                // });
                console.log(lossList);
                console.log(accList);
                // 清空lossList,accList
                lossList = [];
                accList = [];
                currentEpoch = 1;
                get_checkpoints_path();
                invervalEpoch = Math.floor(G_totalEpoch / 10);
                // 最后绘制图表的x轴
                lossOption.xAxis.data = [];
                accOption.xAxis.data = [];
                for (var i = 1; i <= G_totalEpoch; i++) {
                    if (i % invervalEpoch == 0) {
                        lossOption.xAxis.data.push(i.toString());
                        accOption.xAxis.data.push(i.toString());
                    }
                }
                lossChart.setOption(lossOption);
                accChart.setOption(accOption);
                // 训练按钮被启用
                document.getElementById('start-train-btn').disabled = false;

            }

        }
    })
}



function setTrainProgressBar(epoch) {
    var percent = epoch / G_totalEpoch * 100;
    var progressBar = document.getElementById('progress-bar');
    progressBar.setAttribute("aria-valuenow", percent.toString());
    progressBar.style.width = percent.toString() + "%";
}

function clearTrainProgressBar() {
    var progressBar = document.getElementById('progress-bar');
    progressBar.setAttribute("aria-valuenow", "0");
    progressBar.style.width = "0%";
}

function setTrainFinishModal(checkpoints_path) {
    console.log("setTrainFinishModal");
    var trainFinishModal = document.getElementById('trainFinishModal');
    trainFinishModal.setAttribute("aria-labelledby", "Train Finish");
    body = trainFinishModal.getElementsByClassName("modal-body")[0];
    p = body.getElementsByTagName("p")[0];
    p.innerHTML = "训练已经结束，模型权重和日志保存路径为:" + checkpoints_path;
    // 设置自动换行
    p.style.wordWrap = "break-word";
    $('#trainFinishModal').modal('show');
}


// const steps = document.querySelectorAll('.step');

// steps.forEach((step, index) => {
//   step.addEventListener('click', () => {
//     // 移除先前高亮的步骤
//     document.querySelector('.step.active')?.classList.remove('active');
//     // 高亮当前点击的步骤
//     step.classList.add('active');
//   });
// });


// 当点击设置其他参数
document.getElementById('set-other-params-btn').addEventListener('click', function () {
    fetch('/mmedu/get_local_pretrained_model', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            // 将data中的模型列表添加到select中
            var pretrainedModelSelect = document.getElementById('pretrained-select');
            pretrainedModelSelect.innerHTML = '';
            var option_none = document.createElement("option");
            option_none.text = "不使用";
            option_none.value = "None";
            pretrainedModelSelect.appendChild(option_none);
            var option_custom = document.createElement("option");
            option_custom.text = "自定义";
            option_custom.value = "custom";
            pretrainedModelSelect.appendChild(option_custom);
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement("option");
                option.text = data[i];
                option.value = data[i];
                pretrainedModelSelect.appendChild(option);
            }

            // 如果选择了自定义，就加入一个自定义的输入框
            pretrainedModelSelect.addEventListener('change', function () {
                var selectedPretrainedModel = pretrainedModelSelect.options[pretrainedModelSelect.selectedIndex].value;
                if (selectedPretrainedModel == "custom") {
                    // 创建一个input
                    var input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("id", "custom-pretrained-model");
                    input.setAttribute("class", "form-control");
                    input.setAttribute("placeholder", "请输入预训练模型的绝对路径");
                    pretrainedModelSelect.parentNode.appendChild(input);
                }
                else {
                    // 删除input
                    var input = document.getElementById("custom-pretrained-model");
                    if (input != null) {
                        input.parentNode.removeChild(input);
                    }
                }
            });
        })




});
     /*<div class="step" type="button">
                        <div class="step-progress left done">
                            <div class="step-line"></div>
                            <span class="step-num">1</span>
                        </div>
                        <div class="step-text">
                            <span>任务选择</span>
                        </div>
                    </div> */
    
    const steps = document.querySelectorAll('.step');
    console.log(steps);
    steps.forEach((step) => {
        // 点击steps中的step-num 或者 step-text，跳转到对应的轮播项，index 为step-num的值-1
        step_text = step.getElementsByClassName('step-text')[0];
        step_text.setAttribute("type","button")
        step_text.addEventListener('click', function () {
            var index = parseInt(step.getElementsByClassName('step-num')[0].textContent) - 1;
            console.log(index);
            $('#myCarousel').carousel(index);
        });

        step_num = step.getElementsByClassName('step-num')[0];
        step_num.setAttribute("type","button")

        step_num.addEventListener('click', function () {
            var index = parseInt(step.getElementsByClassName('step-num')[0].textContent) - 1;
            console.log(index);
            $('#myCarousel').carousel(index);
        });
        $(step_text).mouseover(function(){
            $(this).css("color","#3778ce");
        });
        $(step_text).mouseout(function(){
            $(this).css("color","white");
        });

        $(step_num).mouseover(function(){
            $(step_text).css("color","#3778ce");
        });
        $(step_num).mouseout(function(){
            $(step_text).css("color","white");
        });
        
    });