from . import basenn_bp
from flask import render_template, jsonify,request
from .config import *
import json


@basenn_bp.route('/test')
def test():
    return jsonify({'message': 'test success!'})


@basenn_bp.route('/dataset',methods=['GET'])
def dataset():
    return render_template('dataset.html')


@basenn_bp.route('/select_dataset',methods=['POST'])
def select_dataset():
    data = json.loads(request.data)
    dataset = data.get("dataset")
    print("dataset",dataset)
    set_dataset(dataset=dataset)
    update_dataset_path()
    print("dataset now ",global_varibles["dataset"])
    print("dataset_path now ",global_varibles["dataset_path"])
    name = dataset.split("\\")[0]
    path = pip_settings['workfolder'] + "\\checkpoints\\basenn_model\\"
    if not os.path.exists(path+name):
            os.makedirs(path+name)
    return jsonify({'message': '设置成功!', 'success': True})



@basenn_bp.route('/get_local_pretrained_model',methods=['GET'])
def get_local_pretrained_model():
    print("get_local_pretrained_model",get_all_pretrained_model())
    return jsonify({'pretrained_model': get_all_pretrained_model()})


@basenn_bp.route('/set_network',methods=['POST'])
def set_network():
    if request.method == 'POST':
        networks = request.json.get("network")
        print("network option",networks)
        print(type(networks))
        # 处理一下网络结构
        network = {}
        network_list = []
        for n in networks:
            print(n)
            network["id"] = n["id"]
            network["type"] = n["type"]
            network["activation"] = n["activation"]
            inputSize = int(n["inputSize"])
            outputSize = int(n["outputSize"])
            network["size"] = (inputSize,outputSize)
            network_list.append(network)
            network = {}
        set_global_network(network_list)
        print(network_list)
        print("network now ",global_varibles["network"])
        # set_network(network=network)
        # print("network now ",global_varibles["network"])
        response_data = {'message': '设置成功!', 'success': True}
        return jsonify(response_data)
    


@basenn_bp.route('/set_base_cfg',methods=['POST'])
def set_base_cfg():
    if request.method == 'POST':
        lr = request.form['lr']
        epochs = request.form['epochs']
        random_seed = request.form['random_seed']
        batch_size = request.form['batch_size']
        if update_global_varibles(lr=lr,epochs=epochs,random_seed=random_seed,batch_size=batch_size):
            response_data = {'message': '设置成功!', 'success': True}
        else:
            response_data = {'message': '设置失败!', 'success': False}
        return jsonify(response_data)
    

@basenn_bp.route('/set_advance_cfg',methods=['POST'])
def set_advance_cfg():
    if request.method == 'POST':
        request_data = json.loads(request.data)
        loss = request_data["loss"]
        metrics = request_data["metrics"]
        pretrained = request_data["pretrained"]
        set_loss(loss=loss)
        set_metrics(metrics=metrics)

        if pretrained != "None":
            update_pretrained_path(pretrained=pretrained)
        print("global_varibles now ",global_varibles)
        if pretrained.find('\\') == -1:
            # pretrained_model不是一个路径，而是一个预训练模型的名字，则需要更新pretrained_path
            if pretrained != "None":
                update_pretrained_path(pretrained=pretrained)
        else:
            # pretrained_model是一个路径，则直接更新pretrained_path
            set_pretrained_path(pretrained_path=pretrained)
    return jsonify({'message': '设置成功!', 'success': True})



@basenn_bp.route('/get_dataset',methods=['GET'])
def get_basenn_dataset():
    print("get_dataset",get_all_dataset())
    return jsonify({'dataset': get_all_dataset()})



@basenn_bp.route('/get_epoch',methods=['GET'])
def get_epoch():
    return jsonify({'epoch': global_varibles['epochs']})


@basenn_bp.route('/get_checkpoints_path',methods=['GET'])
def get_checkpoints_path():
    return jsonify({'checkpoints_path': global_varibles['checkpoints_path']})

@basenn_bp.route('/convert_model',methods=['GET'])
def convert_model():
    save_path = global_varibles['checkpoints_path']
    # 获取save_path下的.pth文件
    import os
    pth_files = [x for x in os.listdir(save_path) if x.endswith('.pth')]
    print("pth_files",pth_files)
    pth_path = os.path.join(save_path,pth_files[-1])
    print("pth_path",pth_path)
    from BaseNN import nn
    nn_model = nn()
    nn_model.convert(checkpoint=pth_path, out_file=f'{pth_path.split(".")[0]}.onnx')
    return jsonify({'message': '转换成功!', 'success': True,'onnxpath':f'{pth_path.split(".")[0]}.onnx'})
