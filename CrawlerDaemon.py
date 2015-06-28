#!/usr/bin/env python3
import requests
import re
import sqlite3
import time
import atexit

# load config
from foostat import config
from Daemon import Daemon


class CrawlerDaemon(Daemon):
    def run(self):
        # connect to DB
        conn = sqlite3.connect(config["files"]["sqlite_file"])
        c = conn.cursor()

        # register cleanup handler
        def cleanup():
            # close the connection
            c.close()

            # logout from the SSO
            session.get(config["fetch"]["logout_url"])

        atexit.register(cleanup)

        # create table if necessary
        c.execute("CREATE TABLE IF NOT EXISTS stats (at DATETIME NOT NULL, passed INTEGER NOT NULL, failed INTEGER NOT NULL, pending INTEGER NOT NULL)")

        # disable HTTPS warnings
        requests.packages.urllib3.disable_warnings()

        # make the initial request to get the token
        session = requests.Session()

        response = session.get(config["fetch"]["LOGIN_URL"])
        match = re.search(r'<input type="hidden" name="lt" value="(.*?)" />', response.text)
        token = match.group(1)

        match = re.search(r'name="execution" value="(.*?)"', response.text)
        execution = match.group(1)

        # do the real login and redirect to foo
        params = {"username": config["login"]["tu_id"], "password": config["login"]["password"], "lt": token, "execution": execution, "_eventId": "submit",
                  "submit": "ANMELDEN"}
        response = session.post(config["fetch"]["login_url"], params)

        while True:
            response = session.get(config["fetch"]["foo_url"], verify=False)
            # grab the stats
            match = re.search(r'<span style="color:#0f0">(\d+)</span>', response.text)
            passed = match.group(1)

            match = re.search(r'<span style="color:#f00">(\d+)</span>', response.text)
            failed = match.group(1)

            match = re.search(r'<span style="color:#ccc">(\d+)</span>', response.text)
            pending = match.group(1)

            # insert into DB
            c.execute("INSERT INTO stats (at, passed, failed, pending) VALUES (DATETIME('now', 'localtime'), ?, ?, ?)",
                      (passed, failed, pending))

            # commit the cursor
            conn.commit()

            time.sleep(float(config["fetch"]["interval"]))

            # we are done...