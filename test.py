import pkg_resources
packages = [dist.project_name for dist in pkg_resources.working_set]
print(packages)