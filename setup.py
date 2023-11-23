from setuptools import setup, find_packages

setup(
    name="easy-xedu",
    version="0.1.1",
    packages = find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        "flask",
        "flask-cors",
        "flask-socketio",
        "MMEdu>=0.1.21",
        "BaseNN>=0.2.2"
    ],
    python_requires='>=3.8',
    license="MIT",
    description="easy-xedu is a web-based platform for training deep learning models using MMEdu framework.",
    entry_points={'console_scripts': ['easytrain=EasyTrain.run:main','easyconvert=EasyConvert.easyconvert:main']},

    )