from importlib.metadata import PackageNotFoundError, distribution

def has_package(package):
    try:
        distribution(package.decode('ascii'))
        return True
    except PackageNotFoundError:
        return False
