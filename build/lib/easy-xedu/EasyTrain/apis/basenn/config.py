import os
from flask import current_app


def back2pwd(pwd,level):
    """
    返回上`level`数级目录的绝对路径
    """
    for i in range(level+1):
        pwd = os.path.abspath(os.path.dirname(pwd))
    return pwd


# global_varibles = {
#     "dataset":"iris_training.csv",
#     "dataset_path": back2pwd(__file__,4) + "\\datasets\\basenn\\iris\\iris_training.csv",
#     "checkpoints_path": back2pwd(__file__,4) + "\\my_checkpoints", # save fold path
#     "lr": 0.01,
#     "epochs": 10,
#     "network": [{'id': 1, 'type': 'linear', 'activation': 'relu', 'size': (4, 10)}, 
#                 {'id': 2, 'type': 'linear', 'activation': 'relu', 'size': (10, 20)},
#                   {'id': 3, 'type': 'linear', 'activation': 'softmax', 'size': (20, 3)}], # 网络结构，e.g.{"id":1, "name":'linear;,"size":(784,10),"activation":'relu'}
#     "pretrained_path": None,
#     "metrics": "acc", # options: acc mae mse
#     "loss":"CrossEntropyLoss", # options: CrossEntropyLoss MSELoss L1Loss……
#     "random_seed": 42,
#     "batch_size": 32,
#     "optimizer":"SGD"

# }


# global_varibles = {
#     "dataset":"iris\\iris_training.csv",
#     "dataset_path": back2pwd(__file__,4) + "\\datasets\\basenn\\iris\\iris_training.csv",
#     "checkpoints_path": back2pwd(__file__,4) + "\\my_checkpoints", # save fold path
#     "lr": 0.01,
#     "epochs": 10,
#     "network": [{'id': 1, 'type': 'linear', 'activation': 'relu', 'size': (4, 120)}, 
#                 {'id': 2, 'type': 'linear', 'activation': 'relu', 'size': (120, 84)},
#                   {'id': 3, 'type': 'linear', 'activation': 'softmax', 'size': (84, 3)}], # 网络结构，e.g.{"id":1, "name":'linear;,"size":(784,10),"activation":'relu'}
#     "pretrained_path": None,
#     "metrics": "acc", # options: acc mae mse
#     "loss":"CrossEntropyLoss", # options: CrossEntropyLoss MSELoss L1Loss……
#     "random_seed": 42,
#     "batch_size": 128,
#     "optimizer":"Adam"
# }

pip_settings = {
    "workfolder" : os.getcwd(), # pip包安装特有
}

global_varibles = {
    "dataset":"test\\train.csv",
    "dataset_path": pip_settings["workfolder"]+ "\\datasets\\basenn\\test\\normed_train.csv",
    "checkpoints_path": pip_settings["workfolder"]+ "\\my_checkpoints", # save fold path
    "lr": 0.01,
    "epochs": 10,
    "network": [{'id': 1, 'type': 'linear', 'activation': 'relu', 'size': (3, 60)}, 
                {'id': 2, 'type': 'linear', 'activation': 'relu', 'size': (60, 60)},
                  {'id': 3, 'type': 'linear', 'activation': 'relu', 'size': (60, 6)},
                  {'id': 4, 'type': 'linear', 'activation': 'None','size': (6, 1)},
                  ],
    "pretrained_path": None,
    "metrics": "mse", # options: acc mae mse
    "loss":"MSELoss", # options: CrossEntropyLoss MSELoss L1Loss……
    "random_seed": 42,
    "batch_size": 32,
    "optimizer":"Adam"
}




def get_all_pth(pwd):
    pth_list = []
    for file in os.listdir(pwd):
        if os.path.isdir(os.path.join(pwd,file)):
            pth_list.extend(get_all_pth(os.path.join(pwd,file)))
        else:
            if file.split(".")[-1] == "pth":
                pth_list.append(file)
    return pth_list


def get_all_pretrained_model():
    pwd = pip_settings["workfolder"] + "\\checkpoints\\basenn_model"+ "\\" + global_varibles['dataset'].split("\\")[0]
    return get_all_pth(pwd)
    

def set_global_network(network):
    global_varibles["network"] = network

def set_batch_size(batch_size):
    global_varibles["batch_size"] = batch_size

def set_optimizer(optimizer):
    global_varibles["optimizer"] = optimizer

def set_dataset_path(dataset_path):
    global_varibles["dataset_path"] = dataset_path

def set_basenn_checkpoints_path(checkpoints_path):
    global_varibles["checkpoints_path"] = checkpoints_path

def set_lr(lr):
    global_varibles["lr"] = lr

def set_epochs(epochs):
    global_varibles["epochs"] = epochs

def set_pretrained_path(pretrained_path):
    global_varibles["pretrained_path"] = pretrained_path

def set_metrics(metrics):
    global_varibles["metrics"] = metrics

def set_loss(loss):
    global_varibles["loss"] = loss

def set_random_seed(random_seed):
    global_varibles["random_seed"] = random_seed

def set_dataset(dataset):
    global_varibles["dataset"] = dataset

def update_global_varibles(**kwargs):
    for k,v in kwargs.items():
        global_varibles[k] = v
    print("global_varibles now ",global_varibles)
    return True

def update_pretrained_path(pretrained):
    pwd = pip_settings["workfolder"]
    pretrained_path = pwd + "\\checkpoints\\" + global_varibles['dataset'] + "\\" + pretrained
    global_varibles['pretrained_path'] = pretrained_path

def update_dataset_path():
    global_varibles["dataset_path"] = pip_settings["workfolder"] + "\\datasets\\" + global_varibles["dataset"]


def get_all_dataset():
    dataset_list = []
    pwd = pip_settings["workfolder"] + "\\datasets\\basenn"
    dirs = os.listdir(pwd)
    # print(dirs)
    for dir in dirs:
        for file in os.listdir(os.path.join(pwd,dir)):
            # print(os.path.join(pwd,dir,file))
            if os.path.isfile(os.path.join(pwd,dir,file)):
                dataset_list.append(os.path.join(dir,file))
    return dataset_list

def update_dataset_path():
    global_varibles["dataset_path"] = pip_settings["workfolder"] + "\\datasets\\basenn\\" + global_varibles["dataset"]



def _add_code(type,size,activation,**kwarg):
    if activation!="None":
        return f"model.add(layer='{type}',size={size},activation='{activation}')"
    else:
        return f"model.add(layer='{type}',size={size})"
    
def _add_optimizer(optimizer):
    return f"model.add(optimizer='{optimizer}')"


def check_if_regression():
    if global_varibles["metrics"] == "mse" or global_varibles["metrics"] == "mae":
        return True
    else:
        return False

def generate_basenn_code():
    update_dataset_path()
    full_code = ""
    # import
    import_part = "# coding:utf-8"+"\n"+"from BaseNN import nn" + "\n"
    def_part = "def generated_train():"+"\n"
    model_part = "\t"+"model = nn()" + "\n"
    dataset_part = ""
    # 如果dataset不是文件夹，那么设置dataset路径
    if check_if_regression():
        dataset_part = "\t"+f"model.load_tab_data(r'{global_varibles['dataset_path']}',y_type='float',batch_size={global_varibles['batch_size']})"+ "\n"
    else:
        dataset_part = "\t"+f"model.load_tab_data(r'{global_varibles['dataset_path']}',y_type='long',batch_size={global_varibles['batch_size']})"+ "\n"
    # save_fold
    save_part = "\t"+f"model.save_fold = r'{global_varibles['checkpoints_path']}'"+ "\n"
    # random_seed
    seed_part = "\t"+f"model.set_seed({global_varibles['random_seed']})" + "\n"
    # network
    construct_part=""
    train_part=""
    for n in global_varibles["network"]:
        construct_part += "\t"+_add_code(n["type"],n["size"],n["activation"]) + "\n"
    optimizer_part = "\t"+_add_optimizer(global_varibles["optimizer"]) + "\n"
    if global_varibles['pretrained_path'] is None:
        train_part = "\t"+f"model.train(epochs={global_varibles['epochs']},lr={global_varibles['lr']},loss='{global_varibles['loss']}',metrics=['{global_varibles['metrics']}'])" + "\n"
    else:
        train_part = "\t"+f"model.train(epochs={global_varibles['epochs']},lr={global_varibles['lr']},loss='{global_varibles['loss']}',metrics=['{global_varibles['metrics']}'],checkpoint='{global_varibles['pretrained_path']}')" + "\n"
    entry_part = "\n"+"if __name__ == '__main__':"+"\n"+"\t"+"generated_train()"+"\n"
    full_code = import_part + "\n" + def_part +model_part + dataset_part + save_part + seed_part + optimizer_part  + construct_part + train_part + entry_part
    with current_app.app_context():
        with open(f"{pip_settings['workfolder']}/basenn_code.py","w") as f:
            f.write(full_code)
        return full_code

# generate_code()