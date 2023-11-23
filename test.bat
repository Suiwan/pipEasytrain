@echo off
python setup.py sdist bdist_wheel
pip uninstall easy-xedu -y
pip install ./dist/easy_xedu-0.1.1-py3-none-any.whl
easytrain --workfolder D:\workspace\test
