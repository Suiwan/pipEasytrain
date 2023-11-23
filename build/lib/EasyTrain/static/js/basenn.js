document.addEventListener("DOMContentLoaded", function () {


    // 获取数据集列表
    function getAllDataset() {
        fetch('/basenn/get_dataset', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // 将数据集列表添加到下拉框中
                var datasetSelect = document.getElementById("dataset-select");
                for (var i = 0; i < data.dataset.length; i++) {
                    var option = document.createElement("option");
                    // replace \\ with /
                    option.text = data.dataset[i];
                    option.value = data.dataset[i];
                    datasetSelect.add(option);
                }

            });
    }

    // 更新轮播项的内容
    function updateCarouselContent(dataset) {
        var carouselItems = document.querySelectorAll('.carousel-item');
        var subtitle = carouselItems[0].querySelector('.subtitle');
        subtitle.textContent = '当前选择的数据集是：' + dataset;
    }



    getAllDataset();

    document.getElementById("dataset-submit-btn").addEventListener("click", function (event) {
        event.preventDefault();
        var datasetSelect = document.getElementById("dataset-select");
        var dataset = datasetSelect.options[datasetSelect.selectedIndex].value;
        console.log(dataset);
        fetch('/basenn/select_dataset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataset: dataset
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    // 跳转到下一轮播页面
                    updateCarouselContent(dataset);
                    $('#myCarousel').carousel('next');
                }
                else {
                    alert("数据集选择失败，请检查数据集是否正确！");
                }
            });
    });



    const addLayerButton = document.getElementById("addLayer");
    addLayerButton.addEventListener("click", addLayer);

    let lineList = [];

    let previousOutputSize = 0;


    function addLayer() {
        // 添加新层
        const network = document.querySelector(".network");
        const existingLayers = network.querySelectorAll(".layer");
        // console.log(existingLayers.length);
        newLayer = createLayer(existingLayers.length + 1);
        network.appendChild(newLayer);

        const nowLayerLength = existingLayers.length + 1;

        if (nowLayerLength == 1) {
            // 如果是第一层，添加监听器以更新上一层的输出维度
            const firstOutput = document.getElementById(`output-size${nowLayerLength}`);
            firstOutput.addEventListener("input", function () {
                const firstoutputSize = parseInt(firstOutput.value);
                if (!isNaN(firstoutputSize)) {
                    previousOutputSize = firstoutputSize;
                }
            });
        }
        else if (nowLayerLength > 1) {
            // 对于后续层，为输出维度添加监听以更新输入维度
            for (let i = 1; i < nowLayerLength; i++) {
                const output = document.getElementById(`output-size${i}`);
                const input = document.getElementById(`input-size${i + 1}`);
                output.addEventListener("input", () => {
                    const currentOutput = document.getElementById(`output-size${i}`);
                    const outputSize = parseInt(currentOutput.value);
                    if (!isNaN(outputSize)) {
                        input.value = outputSize;
                    }
                });
            }

            // 为最后一层添加监听器，以更新输出维度
            const lastOutput = document.getElementById(`output-size${nowLayerLength}`);
            lastOutput.addEventListener("input", function () {
                const lastoutputSize = parseInt(lastOutput.value);
                if (!isNaN(lastoutputSize)) {
                    previousOutputSize = lastoutputSize;
                }
            });
        }

        // 重新绘制线
        if (nowLayerLength > 1) {
            // 先将之前的线删除
            for (let i = 0; i < lineList.length; i++) {
                lineList[i].remove();
            }
            lineList = [];
            // 重新绘制线
            for (let i = 0; i < nowLayerLength - 1; i++) {
                line = createLine(document.getElementById(`layer-${i + 1}`), document.getElementById(`layer-${i + 2}`))
                lineList.push(line);
            }
        }
    }


    function createLine(layer1, layer2) {
        const line = new LeaderLine(layer1, layer2, { color: "white", dash: { animation: true } });
        line.setOptions({ startSocket: 'right', endSocket: 'left' });
        line.path = 'grid';
        return line;
    }


    function createLayer(layerNumber) {
        const layer = document.createElement("div");
        layer.className = "layer";
        layer.id = `layer-${layerNumber}`;

        const layerInfo = document.createElement("div");
        layerInfo.className = "layer-info";
        layerInfo.innerHTML = `
            <span class="layer-number">Layer #${layerNumber}</span>
            <span class="layer-type">类型：Linear</span>
        `;


        const layerDimensions = document.createElement("div");
        layerDimensions.className = "layer-dimensions";
        layerDimensions.innerHTML = `
        <span class="layer-name">输入维度:</span>
            <input type="text"  id="input-size${layerNumber}" value="${previousOutputSize}">
            <span class="layer-name">输出维度:</span>
            <input type="text"  id="output-size${layerNumber}" value="0">
        `;

        const activationDropdown = document.createElement("div");
        activationDropdown.className = "activation-dropdown";
        activationDropdown.innerHTML = `<span class="layer-name">激活函数:</span>
            <select>
            <option value="None">None</option>
                <option value="relu">ReLU</option>
                <option value="softmax">Softmax</option>
            </select>
        `;
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        // deleteButton.classList.add("btn");
        // deleteButton.classList.add("btn-outline-danger");
        deleteButton.textContent = "x";
        // const deleteButton = document.createElement("img");
        // deleteButton.className = "delete-button";


        deleteButton.addEventListener("click", removeLayer);
        layer.appendChild(layerInfo);
        layer.appendChild(layerDimensions);
        layer.appendChild(activationDropdown);
        layer.appendChild(deleteButton);
        return layer;
    }


    function removeLayer(event) {
        // 删除当前层
        const layer = event.target.parentNode;
        // 删除线
        const layerId = layer.id;
        const layerNumber = layerId.split("-")[1];

        layer.classList.add("deleting");
        layer.parentNode.removeChild(layer);
        // 重新编号
        const layers = document.querySelectorAll(".layer");
        // console.log(layers);
        console.log(layers.length);
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const layerNumber = layer.querySelector(".layer-number");
            layerNumber.textContent = `Layer #${i + 1}`;
            layer.id = `layer-${i + 1}`;
        }

        // 重新绘制线
        // 先将之前的线删除
        for (let i = 0; i < lineList.length; i++) {
            lineList[i].remove();
        }
        lineList = [];
        // 重新绘制线
        for (let i = 0; i < layers.length - 1; i++) {
            line = createLine(document.getElementById(`layer-${i + 1}`), document.getElementById(`layer-${i + 2}`))
            lineList.push(line);
        }
    }

    // 当层数过多时，滑动过程中会出现线的断裂，有些线需要隐藏，有些线需要显示
    var myNetwork = document.querySelector(".network-container");
    myNetwork.addEventListener("scroll", function () {
        for (let i = 0; i < lineList.length; i++) {
            lineList[i].position();
        }
    });

    // 当轮播到其他页面或者跳转到别的页面，线需要隐藏，当轮播到当前页面时，线需要显示
    function showLine() {
        for (let i = 0; i < lineList.length; i++) {
            lineList[i].show(['draw']);
        }
    }

    function hideLine() {
        for (let i = 0; i < lineList.length; i++) {
            lineList[i].hide(['fade', [{ duration: 10 }]]);
        }
    }

    // 跳转到其他页面时候隐藏线
    $(document).ready(function () {
        $('#myCarousel').on('slid.bs.carousel', function () {
            var currentIndex = $('#myCarousel .active').index();
            if (currentIndex == 1) {
                showLine();
            }
            else {
                hideLine();
            }
        });
    });


    // 算法1：通过监听滚动事件，获取滚动条的位置，当滚动条的位置大于某个值时，隐藏线
    // 如果向下滚动，每滚动80px，从上往下隐藏一条线，如果向上滚动，每滚动80px，从下往上隐藏一条线
    // var scrollPos = 0;
    // var networkContainer = document.querySelector(".network-container");
    // networkContainer.addEventListener("scroll", function(){
    // var currentScrollPos = networkContainer.scrollTop;
    // console.log(currentScrollPos);
    // if (currentScrollPos > scrollPos){
    //     // 向下滚动
    //     num = parseInt(currentScrollPos/80);
    //     for (let i = 0; i < num; i++) {
    //         lineList[i].hide(['draw']);
    //     }
    //     for (let i = 0; i < lineList.length-num; i++) {
    //         lineList[lineList.length-1-i].show(['draw']);
    //     }
    //     scrollPos = currentScrollPos;
    // }
    // else{ // todo 微调一下算法，这块也可以不加，因为下方的线不是很妨碍观感。 网络搭建基本完成-10.31
    //     num = parseInt((scrollPos - currentScrollPos)/80);
    //     for (let i = 0; i < num; i++) {
    //         lineList[i].show(['draw']);
    //     }
    // }
    // });

    // 算法2：通过监听每一层的位置，当某一层的位置大于某个值时，隐藏线
    // 获得容器的高度
    var networkContainer = document.querySelector(".network-container");
    // 监听滚动事件
    networkContainer.addEventListener("scroll", function () {
        var networkTop = networkContainer.offsetTop;
        var networkHeight = networkContainer.offsetHeight;
        var networkBottom = networkTop + networkHeight;
        console.log(networkTop);
        console.log(networkBottom);
        // 获得每一层的高度
        var layers = document.querySelectorAll(".layer");
        var layerTop = [];
        var layerBottom = [];
        for (let i = 0; i < layers.length; i++) {
            layerTop.push(layers[i].offsetTop);
            layerBottom.push(layers[i].offsetTop + layers[i].offsetHeight);
        }
        console.log(layerTop);
        console.log(layerBottom);

        var currentScrollPos = networkContainer.scrollTop;
        console.log(currentScrollPos);
        for (let i = 0; i < layers.length - 1; i++) {
            if (layerTop[i] > currentScrollPos && layerTop[i] < currentScrollPos + networkHeight) {
                lineList[i].show(['draw']);
            }
            else {
                lineList[i].hide(['draw']);
            }
        }
    });

    // 鼠标悬停到删除按钮上时，删除按钮变红
    $(".delete-button").mouseover(function () {
        $(this).css("color", "red");
    });

    // 监听提交按钮，提交网络结构到后盾
    const submitButton = document.getElementById("network-submit-btn");
    submitButton.addEventListener("click", submitNetwork);


    function submitNetwork() {
        // 获得所有层的信息
        const layers = document.querySelectorAll(".layer");
        const layerInfoList = [];
        let layerInfo = {};
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const id = i + 1;
            const type = "linear"
            const inputSize = layer.querySelector(`#input-size${i + 1}`).value;
            const outputSize = layer.querySelector(`#output-size${i + 1}`).value;
            const activation = layer.querySelector(".activation-dropdown select").value;
            layerInfo = {
                "id": id,
                "type": type,
                "inputSize": inputSize,
                "outputSize": outputSize,
                "activation": activation
            };
            layerInfoList.push(layerInfo);
        }
        console.log(layerInfoList);

              // 检查输入维度是否为正整数
              for (let i = 0; i < layerInfoList.length; i++) {
                inputSize = parseInt(layerInfoList[i]['inputSize']);
                if (!Number.isInteger(inputSize) || inputSize <= 0) {
                    info = "第" + (i + 1) + "层的输入维度必须为正整数！";
                    alert(info);
                    return;
                }
            }

                   // 检查输出维度是否为正整数
            for (let i = 0; i < layerInfoList.length; i++) {
                outputSize = parseInt(layerInfoList[i]['outputSize']);
                if (!Number.isInteger(outputSize) || outputSize <= 0) {
                    info = "第" + (i + 1) + "层的输出维度必须为正整数！";
                    alert(info);
                    return;
                }
            }

        // 检查输入和输出维度是否匹配
        for (let i = 0; i < layerInfoList.length - 1; i++) {
            inputSize = parseInt(layerInfoList[i+1]['inputSize']);
            outputSize = parseInt(layerInfoList[i]['outputSize']);
            if (inputSize != outputSize) {
                console.log(inputSize, outputSize);
                info = "第" + (i + 1) + "层的输出维度必须等于第" + (i + 2) + "层的输入维度！";
                alert(info);
                return;
            }
        }


        fetch("/basenn/set_network", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                network: layerInfoList
            })
        }).then(response => response.json())
            .then(result => {
                console.log(result);
                if (result.success) {
                    // 跳转到下一轮播页面
                    // $('#myModal2').modal('show');
                    $('#myCarousel').carousel('next');

                }
                else {
                    alert("网络结构设置失败，请检查网络结构是否正确！");
                }
            });
    }



    // 设置训练参数

    // 表单提交
    document.getElementById("train_cfg_form").addEventListener("submit", function (event) {
        event.preventDefault();

        var formData = new FormData(this);

        // todo：参数检查
        fetch('/basenn/set_base_cfg', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // 处理成功响应
                console.log(data);
                // 在这里可以执行其他操作，例如更新页面内容
                // 显示模态框
                if (data.success) {
                    $('#myModal3').modal('show');
                }
                else {
                    alert("参数设置失败，请检查参数是否正确！");
                }

            })
            .catch(error => {
                // 处理错误
                console.error(error);
            })

    });

    // 提交其他参数到后端
    document.getElementById("advset-submit-btn").addEventListener("click", function (event) {
        event.preventDefault();
        var metricsSelect = document.getElementById("metrics-select");
        var metrics = metricsSelect.options[metricsSelect.selectedIndex].value;
        var lossSelect = document.getElementById("loss-select");
        var loss = lossSelect.options[lossSelect.selectedIndex].value;
        var pretrainedSelect = document.getElementById("pretrained-select");
        var pretrained = pretrainedSelect.options[pretrainedSelect.selectedIndex].value;

        var requestData = {
            "metrics": metrics,
            "loss": loss,
            "pretrained": pretrained
        };
        console.log(requestData);
        fetch('/basenn/set_advance_cfg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    // 跳转到下一轮播页面
                    // $('#myCarousel').carousel('next');
                    $('#cfgModal').modal('hide');
                }
                else {
                    alert("参数设置失败，请检查参数是否正确！");
                }
            });
    });



    // 点击生成代码
    document.getElementById('code-generate-btn').addEventListener('click', function () {
        // 发送POST请求到Flask后端
        fetch('/basenn/get_code', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                // 处理成功响应
                console.log(data);
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

    // 函数：点击跳转到下一轮播项
function nextCarouselItem() {
    $('.carousel').carousel('next');
}

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



    var G_totalEpoch = 0;
    var G_checkpoints_path = "";

    function get_epoch() {
        // 从后端获取总epoch
        fetch('/basenn/get_epoch', {
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


    var lossChart = echarts.init(document.getElementById('loss-chart'));
    var accChart = echarts.init(document.getElementById('acc-chart'));

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





    var total_log_data = [];

    // 点击开始训练按钮，发送请求到后端
    document.getElementById('start-train-btn').addEventListener('click', function () {
        console.log("start training");
        get_epoch();
        fetch('/basenn/start_thread', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => response.json())
            .then(data => {
                console.log(data);
            });
        // 按钮被禁用
        document.getElementById('start-train-btn').disabled = true;

        clearTrainProgressBar();
        poll_log();
        // 按钮被禁用
        // document.getElementById('start-train-btn').disabled = true;
    });


    // 点击结束训练按钮，发送请求到后端
    document.getElementById('stop-train-btn').addEventListener('click', function () {
        fetch('/basenn/stop_thread', {
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
                lossChart.hideLoading();
                accChart.hideLoading();
                // console.log(total_log_data);
                if (data.success) {
                    $('#trainTerminateModal').modal('show');
                }
                else {
                    trainTerminateModal = document.getElementById('trainTerminateModal');
                    body = trainTerminateModal.getElementsByClassName("modal-body")[0];
                    p = body.getElementsByTagName("p")[0];
                    p.innerHTML = data.message;
                    // 设置自动换行
                    p.style.wordWrap = "break-word";
                    $('#trainTerminateModal').modal('show');
                }

            });
    });

    num = 0;
    const socket = io.connect('http://localhost:5000');
    function poll_log() {
        lossList = []
        accList = []
        currentEpoch = 0
        length_per_epoch = 0
        temp_loss = [];
        temp_acc = [];
        // 清除图表数据
        lossOption.series[0].data = [];
        accOption.series[0].data = [];

        // chart的加载动画
        lossChart.showLoading();
        accChart.showLoading();

        lossChart.setOption(lossOption);
        accChart.setOption(accOption);
        flag = 0;
        const data_reg_acc = /\{epoch:(.*)  Loss:(.*)  Accuracy:(.*)\}/;
        const data_reg_mae = /\{epoch:(.*)  Loss:(.*)  MAE:(.*)\}/;
        const data_reg_mse = /\{epoch:(.*)  Loss:(.*)  MSE:(.*)\}/;
        const checkpoints_reg = /保存模型(.*)成功！/;
        socket.on('log1', (data) => {
            if (flag == 0) {
                lossChart.hideLoading();
                accChart.hideLoading();
                lossChart.setOption(lossOption);
                accChart.setOption(accOption);
                flag = 1;
            }
            // 显示图表的坐标轴
            // 判断data是否含有{},如果有，则包含了epoch,loss,accuracy等信息data = '{epoch:0  Loss:2.0790  Accuracy:0.1172}\n'
            if (data.includes("{")) {
                // console.log(num, data);
                // 使用正则表达式提取epoch,loss,Accuracy
                if (data.includes("Accuracy")) {
                    var result = data_reg_acc.exec(data);
                    epoch = parseInt(result[1]); // 记得转换！！，否则计算时会有问题
                    loss = parseFloat(result[2]);
                    acc = parseFloat(result[3]);
                    if (epoch == currentEpoch) {
                        temp_loss.push(loss);
                        temp_acc.push(acc);
                    }
                    else if (epoch != currentEpoch) {
                        console.log("draw chart")
    
                        var loss_sum = 0;
                        var acc_sum = 0;
                        // 求temp_loss temp_acc 的平均值
                        for (var i = 0; i < temp_loss.length; i++) {
                            loss_sum += parseFloat(temp_loss[i]);
                            acc_sum += parseFloat(temp_acc[i]);
                        }
                        var avgLoss = loss_sum / temp_loss.length;
                        var avgAcc = acc_sum / temp_acc.length;
                        // 设置进度条
                        setTrainProgressBar(epoch);
                        // 更新图表
                        lossOption.series[0].data.push(avgLoss);
                        lossChart.setOption(lossOption);
                        accOption.series[0].data.push(avgAcc);
                        accChart.setOption(accOption);
                        // 清空temp_loss temp_acc
                        temp_loss = [];
                        temp_acc = [];
                        lossList.push(avgLoss);
                        accList.push(avgAcc);
                        currentEpoch += 1
                        temp_loss.push(loss);
                        temp_acc.push(acc);
                        console.log(epoch, currentEpoch)
                    }
                }

                else if (data.includes("MAE")){
                    var result = data_reg_mae.exec(data);
                    epoch = parseInt(result[1]); // 记得转换！！，否则计算时会有问题
                    loss = parseFloat(result[2]);
                    acc = parseFloat(result[3]);

                    // 修改AccChart为MAEChart
                    accOption.title.text = "MAE Chart";
                    accOption.yAxis.name = "MAE";
                    accOption.series[0].name = "MAE";
                    accOption.legend.data = ["MAE"];
                    accChart.setOption(accOption);

                    if (epoch == currentEpoch) {
                        temp_loss.push(loss);
                        temp_acc.push(acc);
                    }
                    else if (epoch != currentEpoch) {
                        console.log("draw chart")
    
                        var loss_sum = 0;
                        var acc_sum = 0;
                        // 求temp_loss temp_acc 的平均值
                        for (var i = 0; i < temp_loss.length; i++) {
                            loss_sum += parseFloat(temp_loss[i]);
                            acc_sum += parseFloat(temp_acc[i]);
                        }
                        var avgLoss = loss_sum / temp_loss.length;
                        var avgAcc = acc_sum / temp_acc.length;
                        // 设置进度条
                        setTrainProgressBar(epoch);
                        // 更新图表
                        lossOption.series[0].data.push(avgLoss);
                        lossChart.setOption(lossOption);
                        accOption.series[0].data.push(avgAcc);
                        accChart.setOption(accOption);
                        // 清空temp_loss temp_acc
                        temp_loss = [];
                        temp_acc = [];
                        lossList.push(avgLoss);
                        accList.push(avgAcc);
                        currentEpoch += 1
                        temp_loss.push(loss);
                        temp_acc.push(acc);
                        console.log(epoch, currentEpoch)
                    }
                }
                else if(data.includes("MSE")){
                    var result = data_reg_mse.exec(data);
                    epoch = parseInt(result[1]); // 记得转换！！，否则计算时会有问题
                    loss = parseFloat(result[2]);
                    acc = parseFloat(result[3]);
                    // 修改AccChart为MSEChart
                    accOption.title.text = "MSE Chart";
                    accOption.yAxis.name = "MSE";
                    accOption.series[0].name = "MSE";
                    accOption.legend.data = ["MSE"];
                    accChart.setOption(accOption);
                    if (epoch == currentEpoch) {
                        temp_loss.push(loss);
                        temp_acc.push(acc);
                    }
                    else if (epoch != currentEpoch) {
                        console.log("draw chart")
    
                        var loss_sum = 0;
                        var acc_sum = 0;
                        // 求temp_loss temp_acc 的平均值
                        for (var i = 0; i < temp_loss.length; i++) {
                            loss_sum += parseFloat(temp_loss[i]);
                            acc_sum += parseFloat(temp_acc[i]);
                        }
                        var avgLoss = loss_sum / temp_loss.length;
                        var avgAcc = acc_sum / temp_acc.length;
                        // 设置进度条
                        setTrainProgressBar(epoch);
                        // 更新图表
                        lossOption.series[0].data.push(avgLoss);
                        lossChart.setOption(lossOption);
                        accOption.series[0].data.push(avgAcc);
                        accChart.setOption(accOption);
                        // 清空temp_loss temp_acc
                        temp_loss = [];
                        temp_acc = [];
                        lossList.push(avgLoss);
                        accList.push(avgAcc);
                        currentEpoch += 1
                        temp_loss.push(loss);
                        temp_acc.push(acc);
                        console.log(epoch, currentEpoch)
                    }
                }
          
            }

            // 当data出现类似保存模型D:\workspace\XEdu\EasyDL2.0\checkpoints\basenn_20231103_162909\basenn.pth成功！时
            // 清空lossList,accList
            if (data.includes("成功")) {
                // console.log(temp_loss,temp_acc)
                var loss_sum = 0;
                var acc_sum = 0;
                // 求temp_loss temp_acc 的平均值
                for (var i = 0; i < temp_loss.length; i++) {
                    loss_sum += temp_loss[i];
                    acc_sum += temp_acc[i];
                }
                var avgLoss = loss_sum / temp_loss.length;
                var avgAcc = acc_sum / temp_acc.length;
                // 设置进度条
                setTrainProgressBar(epoch);
                // 更新图表
                lossOption.series[0].data.push(avgLoss);
                lossChart.setOption(lossOption);
                accOption.series[0].data.push(avgAcc);
                accChart.setOption(accOption);
                // 清空temp_loss temp_acc
                temp_loss = [];
                temp_acc = [];
                lossList.push(avgLoss);
                accList.push(avgAcc);
                currentEpoch += 1
                temp_loss.push(loss);
                temp_acc.push(acc);
                // console.log(epoch,currentEpoch)
                // console.log(lossList);
                // console.log(accList);
                lossList = [];
                accList = [];
                currentEpoch = 0;
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
                // 使用正则表达式提取checkpoints_path
                var result = checkpoints_reg.exec(data);
                checkpoints_path = result[1];
                console.log(checkpoints_path);
                setTrainFinishModal(checkpoints_path);
            }
        })
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

    function setTrainProgressBar(epochs) {
        console.log("setTrainProgressBar", epochs, G_totalEpoch);
        console.log(epochs / G_totalEpoch);
        var percent = (epochs + 1) / G_totalEpoch * 100;
        // console.log(percent);
        var progressBar = document.getElementById('progress-bar');
        progressBar.setAttribute("aria-valuenow", percent.toString());
        progressBar.style.width = percent.toString() + "%";
    }

    function clearTrainProgressBar() {
        var progressBar = document.getElementById('progress-bar');
        progressBar.setAttribute("aria-valuenow", "0");
        progressBar.style.width = "0%";
    }


    document.getElementById('set-other-params-btn').addEventListener('click', function () {

        var pretrainedModelSelect = document.getElementById('pretrained-select');
        pretrainedModelSelect.innerHTML = '';
        var option_none = document.createElement("option");
        option_none.text = "不使用预训练模型";
        option_none.value = "None";
        pretrainedModelSelect.appendChild(option_none);
        var option_custom = document.createElement("option");
        option_custom.text = "自定义";
        option_custom.value = "custom";
        pretrainedModelSelect.appendChild(option_custom);
        fetch('/basenn/get_local_pretrained_model', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                data = data['pretrained_model']
                // 将data中的模型列表添加到select中
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


    const steps = document.querySelectorAll('.step-basenn');
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
        fetch('/basenn/convert_model', {
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
});
