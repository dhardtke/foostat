# foostat
Sample config.ini
---------------
    [login]
    tu_id=ab12cdef
    password=thisIsMyAmazingPassword
    
    [files]
    sqlite_file=stats.sqlite
    pid_file=foostat.pid
    log_file=logs/foostat.log
    
    [fetch]
    # in seconds
    interval=1800
    login_url=https://sso.hrz.tu-darmstadt.de/login
    logout_url=https://sso.hrz.tu-darmstadt.de/logout
    foo_url=https://foo.algo.informatik.tu-darmstadt.de
