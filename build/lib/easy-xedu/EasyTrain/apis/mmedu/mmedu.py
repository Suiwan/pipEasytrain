from . import mmedu_bp
from flask import render_template, request, jsonify
from .config import *
import json




@mmedu_bp.route('/index')
def index():
    return render_template('mmeduPage.html',
                        task = global_varibles["task"],
                        model = global_varibles["model"],
                        lr = global_varibles["lr"],
                        epoch = global_varibles["epoch"],
                        batch_size = global_varibles["batch_size"],
                        dataset = global_varibles["dataset"])



@mmedu_bp.route('/select_task',methods=['POST'])
def select_task():
    if request.method == 'POST':
        task = request.json.get("task")
        print("task option",task)
        set_task(task=task)
        print("task now ",global_varibles["task"])
        response_data = {'message': '设置成功!', 'selected_option': task}
        return jsonify(response_data)
    

@mmedu_bp.route('/select_model',methods=['POST'])
def select_model():
    if request.method == 'POST':
        model = request.json.get("model")
        print("model option",model)
        set_model(model=model)
        print("model now ",global_varibles["model"])
        response_data = {'message': '设置成功!', 'selected_option': model}
        return jsonify(response_data)
    
@mmedu_bp.route('/select_dataset',methods=['POST'])
def select_dataset():
    if request.method == 'POST':
        dataset = request.json.get("dataset")
        print("dataset option",dataset)
        set_dataset(dataset=dataset)
        print("dataset now ",global_varibles["dataset"])
        update_dataset_path()
        print("dataset_path now ",global_varibles["dataset_path"])
        response_data = {'message': '设置成功!', 'selected_option': dataset}
        task = global_varibles['task']
        if task=="classification":
            # 检查在checkpoints/mmcls_model/下是否存在该dataset同名文件夹,如果不存在，则创建该文件夹
            path = pip_settings['workfolder'] + "\\checkpoints\\mmedu_cls_model\\"
            if not os.path.exists(path+dataset):
                os.makedirs(path+dataset)
        elif task=="detection":
            path = pip_settings['workfolder']  + "\\checkpoints\\mmedu_det_model\\"
            if not os.path.exists(path+dataset):
                os.makedirs(path+dataset)
        return jsonify(response_data)


@mmedu_bp.route('/set_base_cfg',methods=['POST'])
def set_base_config():
    # 从前端接收form表单数据
    lr = request.form['lr']
    batch_size = request.form['batch_size']
    epoch = request.form['epoch']
    random_seed = request.form['random_seed']
    set_lr(lr=lr)
    # set_batch_size(batch_size=batch_size)
    set_epoch(epoch=epoch)
    set_random_seed(random_seed=random_seed)
    print("set_config")
    print(global_varibles)
    response_data = {'message': '设置成功!'}
    return jsonify(response_data)


@mmedu_bp.route('/set_advance_cfg',methods=['POST'])
def set_advance_config():
    request_data = json.loads(request.data)
    optimizer = request_data['optimizer']
    weight_decay = request_data['weight_decay']
    class_num = request_data['class_num']
    device = request_data['device']
    pretrained_model = request_data['pretrained_model']
    if class_num != "":
        class_num = int(class_num)
        set_class_num(class_num=class_num)
    if weight_decay != "":
        weight_decay = float(weight_decay)
        set_weight_decay(weight_decay=weight_decay)
    set_optimizer(optimizer=optimizer)
    set_device(device=device)

    # 如果pretrained_model不是一个路径，而是一个预训练模型的名字，则需要更新pretrained_path
    # 判断pretrained_model是否是一个路径
    if pretrained_model.find('\\') == -1:
        # pretrained_model不是一个路径，而是一个预训练模型的名字，则需要更新pretrained_path
        update_pretrained_path(pretrained_model=pretrained_model)
    else:
        # pretrained_model是一个路径，则直接更新pretrained_path
        set_pretrained_path(pretrained_path=pretrained_model)
    return jsonify({'message': '设置成功!'})



@mmedu_bp.route('/get_local_dataset',methods=['GET'])
def get_local_dataset():
    if request.method == 'GET':
        print("getting_all_dataset")
        res = get_all_dataset()
        print(res)
        return jsonify(res)

@mmedu_bp.route('/get_local_pretrained_model',methods=['GET'])
def get_local_pretrained_model():
    if request.method == 'GET':
        print("getting_local_pretrained_model")
        pretrained_models = get_all_pretrained_model()
        if global_varibles['task'] == 'classification':
            res = pretrained_models['mmedu_cls_model']
            # 根据dataset_path的最后一个文件夹名字，获取对应的预训练模型
            dataset_path = global_varibles['dataset_path']
            dataset_name = dataset_path.split('\\')[-1]
            model_list = res[dataset_name]
            print(model_list)
            return jsonify(model_list)
        elif global_varibles['task'] == 'detection':
            res = pretrained_models['mmedu_det_model']
            # 根据dataset_path的最后一个文件夹名字，获取对应的预训练模型
            dataset_path = global_varibles['dataset_path']
            dataset_name = dataset_path.split('\\')[-1]
            model_list = res[dataset_name]  # note: 安装包中的dataset名字与预训练模型中的文件夹名字需要保持一致
            print(model_list)
            return jsonify(model_list)



@mmedu_bp.route('/get_epoch',methods=['GET'])
def get_epoch():
    return jsonify({'epoch': global_varibles['epoch']})

@mmedu_bp.route('/get_checkpoints_path',methods=['GET'])
def get_checkpoints_path():
    return jsonify({'checkpoints_path': global_varibles['checkpoints_path']})


@mmedu_bp.route('/convert_model',methods=['GET'])
def convert_model():
    save_path = global_varibles['checkpoints_path']
    # 遍历save_path下的所有pth文件，获取best，并转换为onnx
    # 1. 获取所有pth文件
    pth_list = []
    for root, dirs, files in os.walk(save_path):
        for file in files:
            if file.endswith('.pth'):
                pth_list.append(os.path.join(root, file))
    print(pth_list)
    # 2. 获取best, 以best_accuracy开头
    best_pth=""
    for pth in pth_list:
        if pth.split('\\')[-1].startswith('best_accuracy'):
            best_pth = pth
            break
    if global_varibles['task']=='classification':
        from MMEdu import MMClassification as cls
        cls_model = cls(backbone=global_varibles['model'])
        cls_model.convert(checkpoint=best_pth, out_file=f'{best_pth.split(".")[0]}.onnx')
        return jsonify({'message': '转换成功!', 'onnxpath': f'{best_pth.split(".")[0]}.onnx','success':True})
    elif global_varibles['task']=='detection':
        from MMEdu import MMDetection as det
        det_model = det(backbone=global_varibles['model'])
        det_model.convert(checkpoint=best_pth, out_file=f'{best_pth.split(".")[0]}.onnx')
        return jsonify({'message': '转换成功!', 'onnxpath': f'{best_pth.split(".")[0]}.onnx','success':True})    
    return jsonify({'message': '转换失败!', 'onnxpath': '','success':False})