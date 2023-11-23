# config.py
import os
from flask import current_app

def back2pwd(pwd,level):
    """
    返回上`level`数级目录的绝对路径
    """
    for i in range(level+1):
        pwd = os.path.abspath(os.path.dirname(pwd))
    return pwd

pip_settings = {
    "workfolder" : os.getcwd(), # pip包安装特有
}


global_varibles = {
    "task": "classification",
    "model": "LeNet",
    "dataset": "hand_gray",
    "dataset_path": pip_settings["workfolder"]+ "\\datasets\\mmedu_cls\\hand_gray",
    "checkpoints_path": pip_settings["workfolder"] + "\\my_checkpoints", # D:\\workspace\\XEdu\\EasyDL2.0\\checkpoints\\mmedu_20231106_161141
    # "checkpoints_path":"D:\\workspace\\XEdu\\EasyDL2.0\\checkpoints\\mmedu_20231106_161141",
    "lr": 0.01,
    "epoch": 10,
    "batch_size": None,
    "class_num":3,
    "validate" : True,
    "device": "cpu",
    "optimizer": "SGD",
    "weight_decay": 0.001,
    "random_seed": 42,
    "pretrained_path": None
}


model_list = {
    "classification":["LeNet","ResNet18","ResNet50","MobileNet"],
    "detection":["Yolov3","SSD_Lite","FasterRCNN"],

}

# 设置每个参数，一个方法调整一个参数
def set_task(task):
    global_varibles["task"] = task

def set_model(model):
    global_varibles["model"] = model

def set_lr(lr):
    global_varibles["lr"] = lr

def set_epoch(epoch):
    global_varibles["epoch"] = epoch

def set_batch_size(batch_size):
    global_varibles["batch_size"] = batch_size


def set_dataset_path(dataset_path):
    global_varibles["dataset_path"] = dataset_path

def set_mmedu_checkpoints_path(checkpoints_path):
    global_varibles["checkpoints_path"] = checkpoints_path

def set_dataset(dataset):
    global_varibles["dataset"] = dataset

def set_class_num(class_num):
    global_varibles["class_num"] = class_num

def set_device(device):
    global_varibles["device"] = device

def set_optimizer(optimizer):
    global_varibles["optimizer"] = optimizer

def weight_decay(weight_decay):
    global_varibles["weight_decay"] = weight_decay

def set_random_seed(random_seed):
    global_varibles["random_seed"] = random_seed

def set_weight_decay(weight_decay):
    global_varibles["weight_decay"] = weight_decay

def set_pretrained_path(pretrained_path):
    global_varibles["pretrained_path"] = pretrained_path


def get_all_dataset():
    res = {}
    # 获取cls文件夹下的所有文件夹
    cls_dataset_path = pip_settings["workfolder"]  + "\\datasets\\mmedu_cls"
    cls_dataset_list = os.listdir(cls_dataset_path)
    # 过滤掉非文件夹
    cls_dataset_list = [x for x in cls_dataset_list if os.path.isdir(cls_dataset_path + "\\" + x)]
    res['cls'] = cls_dataset_list
    # 获取det文件夹下的所有文件夹
    det_dataset_path = pip_settings["workfolder"]  + "\\datasets\\mmedu_det"
    det_dataset_list = os.listdir(det_dataset_path)
    # 过滤掉非文件夹
    det_dataset_list = [x for x in det_dataset_list if os.path.isdir(det_dataset_path + "\\" + x)]  
    res['det'] = det_dataset_list
    # print("dataset_list",res)
    return res


def get_all_pretrained_model():  # note： 预训练模型统一按照要求放在checkpoints文件夹的对应task文件夹的对应数据集文件夹下
    pwd = pip_settings["workfolder"] 
    # checkpoints文件夹
    checkpoints_path = pwd + "\\checkpoints"
    print(checkpoints_path)
    checkpoints_list = os.listdir(checkpoints_path)
    # 过滤掉非文件夹
    checkpoints_list = [x for x in checkpoints_list if os.path.isdir(checkpoints_path + "\\" + x)]
    # print(checkpoints_list)
    res = {}
    for x in checkpoints_list:
        # 获取checkpoints文件夹下的所有文件夹
        checkpoints_path = pwd + "\\checkpoints\\" + x
        if os.path.isdir(checkpoints_path):
            checkpoints_list = os.listdir(checkpoints_path)
            temp = {}
            for y in checkpoints_list:
                # 获取checkpoints文件夹下的所有文件夹
                checkpoints_path = pwd + "\\checkpoints\\" + x + "\\" + y
                if os.path.isdir(checkpoints_path):
                    checkpoints_list = os.listdir(checkpoints_path)
                    # 仅保留.pth文件
                    checkpoints_list = [x for x in checkpoints_list if x.endswith('.pth')]
                    temp[y] = checkpoints_list
                else:
                    continue
            res[x] = temp
        else:
            continue
    print(res)
    return res


def update_pretrained_path(pretrained_model):
    pwd = pip_settings["workfolder"]
    if pretrained_model == "None":
        global_varibles['pretrained_path'] = None
        return
    if global_varibles['task'] == 'classification':
        pretrained_path = pwd + "\\checkpoints\\mmedu_cls_model\\" + global_varibles['dataset'] + "\\" + pretrained_model
        global_varibles['pretrained_path'] = pretrained_path
    elif global_varibles['task'] == 'detection':
        pretrained_path = pwd + "\\checkpoints\\mmedu_det_model\\" + global_varibles['dataset'] + "\\" + pretrained_model
        global_varibles['pretrained_path'] = pretrained_path



def update_dataset_path():
    if global_varibles['task'] == 'classification':
        global_varibles["dataset_path"] = pip_settings["workfolder"]+ "\\datasets\\mmedu_cls\\" + global_varibles["dataset"]
    elif global_varibles['task'] == 'detection':
        global_varibles["dataset_path"] = pip_settings["workfolder"]+ "\\datasets\\mmedu_det\\" + global_varibles["dataset"]

def generate_mmedu_code():
    update_dataset_path()
    full_code=""
    if global_varibles['task'] == 'detection':
        import_part = "# coding:utf-8"+"\n"+"from MMEdu import MMDetection as det" + "\n"
        # write_part = "with open(\"pid.pkl\",\"w\") as f:"+"\n"+"\t"+"f.write(str(os.getpid()))"+"\n"
        def_part =  "def generated_train():"+"\n"
        construct_part = "\t"+f"model = det(backbone='{global_varibles['model']}')"+ "\n"
        class_part = "\t"+f"model.num_classes = {global_varibles['class_num']}"+ "\n"
        dataset_part = "\t"+f"model.load_dataset(path=r'{global_varibles['dataset_path']}')"+ "\n"
        save_part = "\t"+f"model.save_fold = r'{global_varibles['checkpoints_path']}'"+ "\n"
        if global_varibles['pretrained_path'] == None:
            train_part = "\t"+f"model.train(epochs={global_varibles['epoch']},validate={global_varibles['validate']},device='{global_varibles['device']}',optimizer='{global_varibles['optimizer']}',lr={global_varibles['lr']}, batch_size={global_varibles['batch_size']},weight_decay={global_varibles['weight_decay']},checkpoint={global_varibles['pretrained_path']},random_seed={global_varibles['random_seed']})" + "\n"+"\n"
        else:
            train_part = "\t"+f"model.train(epochs={global_varibles['epoch']},validate={global_varibles['validate']},device='{global_varibles['device']}',optimizer='{global_varibles['optimizer']}',lr={global_varibles['lr']}, batch_size={global_varibles['batch_size']},weight_decay={global_varibles['weight_decay']},checkpoint=r'{global_varibles['pretrained_path']}',random_seed={global_varibles['random_seed']})" + "\n"+"\n"
        entry_part = "if __name__ == '__main__':"+"\n"+"\t"+"generated_train()"+"\n"
        full_code = import_part + def_part + construct_part + class_part + dataset_part + save_part + train_part + entry_part
        # 写入另一个py文件
        with current_app.app_context():
            with open(f"{pip_settings['workfolder']}/mmedu_code.py","w") as f:
                f.write(full_code)

    elif global_varibles['task'] == 'classification':
        import_part = "# coding:utf-8"+"\n"+"from MMEdu import MMClassification as cls" + "\n"
        def_part =  "def generated_train():"+"\n"
        construct_part = "\t"+f"model = cls(backbone='{global_varibles['model']}')"+ "\n"
        class_part = "\t"+f"model.num_classes = {global_varibles['class_num']}"+ "\n"
        dataset_part = "\t"+f"model.load_dataset(path=r'{global_varibles['dataset_path']}')"+ "\n"
        save_part = "\t"+f"model.save_fold = r'{global_varibles['checkpoints_path']}'"+ "\n"
        if global_varibles['pretrained_path'] == None:
            train_part = "\t"+f"model.train(epochs={global_varibles['epoch']},validate={global_varibles['validate']},device='{global_varibles['device']}',optimizer='{global_varibles['optimizer']}',lr={global_varibles['lr']}, batch_size={global_varibles['batch_size']},weight_decay={global_varibles['weight_decay']},checkpoint={global_varibles['pretrained_path']},random_seed={global_varibles['random_seed']})" + "\n"+"\n"
        else:
            train_part = "\t"+f"model.train(epochs={global_varibles['epoch']},validate={global_varibles['validate']},device='{global_varibles['device']}',optimizer='{global_varibles['optimizer']}',lr={global_varibles['lr']}, batch_size={global_varibles['batch_size']},weight_decay={global_varibles['weight_decay']},checkpoint=r'{global_varibles['pretrained_path']}',random_seed={global_varibles['random_seed']})" + "\n"+"\n"
        entry_part = "if __name__ == '__main__':"+"\n"+"\t"+"generated_train()"+"\n"
        full_code = import_part + def_part + construct_part + class_part + dataset_part + save_part + train_part + entry_part
        with current_app.app_context():
            with open(f"{pip_settings['workfolder']}/mmedu_code.py","w") as f:
                f.write(full_code)
    print("生成代码：",full_code)
    return full_code

# generate_code()