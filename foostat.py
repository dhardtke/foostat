#!/usr/bin/env python3
import configparser
config = configparser.ConfigParser()
config.read("config.ini")

if __name__ == "__main__":
    from CrawlerDaemon import CrawlerDaemon

    import sys

    daemon = CrawlerDaemon(config["files"]["pid_file"])
    if len(sys.argv) == 2:
        if "start" == sys.argv[1]:
            daemon.start()
        elif "stop" == sys.argv[1]:
            daemon.stop()
        elif "restart" == sys.argv[1]:
            daemon.restart()
        elif "status" == sys.argv[1]:
            daemon.status()
        else:
            print("Unknown command")
            sys.exit(2)
        sys.exit(0)
    else:
        print("Usage: {} start|stop|restart".format(sys.argv[0]))
        sys.exit(2)