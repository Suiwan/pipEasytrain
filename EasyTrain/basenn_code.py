# coding:utf-8
from BaseNN import nn

def generated_train():
	model = nn()
	model.load_tab_data(r'C:\Users\lizijian\Desktop\XEdu\datasets\basenn\test\normed_train.csv',y_type='float',batch_size=32)
	model.save_fold = r'C:\Users\lizijian\Desktop\XEdu\my_checkpoints\basenn_20231113_153731'
	model.set_seed(42)
	model.add(optimizer='Adam')
	model.add(layer='linear',size=(3, 60),activation='relu')
	model.add(layer='linear',size=(60, 60),activation='relu')
	model.add(layer='linear',size=(60, 6),activation='relu')
	model.add(layer='linear',size=(6, 1))
	model.train(epochs=10,lr=0.01,loss='MSELoss',metrics=['mae'])

if __name__ == '__main__':
	generated_train()
