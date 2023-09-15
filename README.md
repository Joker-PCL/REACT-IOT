# EXTENSIONS
    - tabnine

# WORK REWRITE APACHE
    * sudo nano /etc/apache2/apache2.conf
        <Directory /var/www/>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>
    
    * sudo service apache2 restart
    - create .htaccess file in folder html
        Options -MultiViews
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ index.html [QSA,L]
    
# SSH REMOTE TO SERVER
    - delete key
        * del C:\Users\Engineer3\.ssh\known_hosts
    - remote to server
        * ssh -L 3306:localhost:3306 engineer@192.168.10.7
    - build project
    - https://medium.com/@badreddine.boudaoud21/create-a-react-app-with-vite-and-deploy-it-on-github-48b82e19f821
        - add a homepage field with the URL to package.json file
            * "homepage": "https://192.168.10.7:3000/dashboard"
        - Add base: “/<repo>/”, to vite.config.js in my example it would be base:
            * "/dashboard/"
        - build project
            * npm run build
        
        ** img: "../img/team-4.jpeg" ** add ".."

# UPLOAD FILE TO SERVER
    - send file
        * scp D:/Project_Verified/Github/SQL/REACT-IOT/README.md engineer@192.168.10.7:/home/engineer
    - send folder
        * scp -r D:/Project_Verified/Github/SQL/REACT-IOT/README.md engineer@192.168.10.7:/home/engineer
        * scp -r D:\Project_Verified\Github\IOT_OEE\REACT-IOT\Fontend-Material\dist/* engineer@192.168.10.7:/var/www/html

# DEBIAN 12 Server
    How to Install Debian 12 Bookworm on Raspberry Pi (2023 update)
        download os firmware https://raspi.debian.net/tested-images/
        install Debian for your Raspberry Pi https://raspberrytips.com/install-debian-on-raspberry-pi/

        - Debian GNU/Linux bookworm/sid rpi4-20230101 tty1
        * Rpi4-20230101 login: root
            - Default login: root
            - Default password: <none>

        * apt update
        * apt upgrade
        * adduser <username>
        * su - root
        * apt install sudo
        * usermod -aG sudo <username>
        * exit
        * sudo apt update
        * sudo tasksel
            - choose software to install
            [*] Debain desktop environment
            [*] ... GNOME
            [*] ... Web server
            [*] ... SSH server
			
# Disable Suspend and Hibernation in Linux
	* sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
		# You get the output shown below:
		- hybrid-sleep.target
		- Created symlink /etc/systemd/system/sleep.target → /dev/null.
		- Created symlink /etc/systemd/system/suspend.target → /dev/null.
		- Created symlink /etc/systemd/system/hibernate.target → /dev/null.
		- Created symlink /etc/systemd/system/hybrid-sleep.target → /dev/null.
		
	* sudo systemctl status sleep.target suspend.target hibernate.target hybrid-sleep.target
		# You get the output shown below:
		○ sleep.target
			 Loaded: masked (Reason: Unit sleep.target is masked.)
			 Active: inactive (dead)

		○ suspend.target
			 Loaded: masked (Reason: Unit suspend.target is masked.)
			 Active: inactive (dead)

		○ hibernate.target
			 Loaded: masked (Reason: Unit hibernate.target is masked.)
			 Active: inactive (dead)

		○ hybrid-sleep.target
			 Loaded: masked (Reason: Unit hybrid-sleep.target is masked.)
			 Active: inactive (dead)

# Enable Suspend and Hibernation in Linux
	# https://www.tecmint.com/disable-suspend-and-hibernation-in-linux/
	* sudo systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target
		# You get the output shown below:
		- Removed /etc/systemd/system/sleep.target.
		- Removed /etc/systemd/system/suspend.target.
		- Removed /etc/systemd/system/hibernate.target.
		- Removed /etc/systemd/system/hybrid-sleep.target.
		
	* sudo systemctl status sleep.target suspend.target hibernate.target hybrid-sleep.target
		# You get the output shown below:
		○ sleep.target
			 Loaded: masked (Reason: Unit sleep.target is masked.)
			 Active: inactive (dead)

		○ suspend.target
			 Loaded: masked (Reason: Unit suspend.target is masked.)
			 Active: inactive (dead)

		○ hibernate.target
			 Loaded: masked (Reason: Unit hibernate.target is masked.)
			 Active: inactive (dead)

		○ hybrid-sleep.target
			 Loaded: masked (Reason: Unit hybrid-sleep.target is masked.)
			 Active: inactive (dead)
	

# SETUP COMMAND 
# https://linux.how2shout.com/how-to-install-apache-php-and-mysql-on-debian-12-or-11/
    - delete key
        * del C:\Users\Engineer3\.ssh\known_hosts
    - remote to server
        * ssh -L 3306:localhost:3306 engineer@192.168.10.7

    * apt-get install net-tools
    * sudo ifconfig

# INSTALL FIREWALL OPEN PORT    
    * sudo apt update
    * sudo apt install ufw -y
        * sudo ufw enable
        * sudo ufw allow OpenSSH
        * sudo ufw allow http
        * sudo ufw allow https
        * sudo ufw allow 3000
        * sudo ufw enable
        * sudo ufw status

# INSTALL MARIADB && PHPMYADMIN
    * sudo apt update && sudo apt upgrade -y
    * sudo apt install apache2
    * sudo systemctl start apache2
    * sudo systemclt enable apache2
    * systemctl status apache

    * sudo apt install php
    * sudo ap install php-{common,mysql,xml,xmlrpc,curl,gd,imagick,cli,dev,imap,mbstring,opcache,soap,zip,intl}

    * sudo apt update
    * sudo apt install mariadb-server
    * sudo systemctl status mariadb
    * sudo apt install phpmyadmin
        [*] apache2
   
    * sudo mysql -u root -p
    * CREATE USER 'engineer'@'%' IDENTIFIED BY 'engineer';
    * GRANT ALL PRIVILEGES ON *.* TO 'engineer'@'%' WITH GRANT OPTION;
    * FLUSH PRIVILEGES;

# OPEN PORT MYSQL PHPMYADMIN && EDIT bind-address MySQL
    * netstat -tuln | grep 3306
    * sudo nano /etc/mysql/mariadb.conf.d/custom.cnf
        # edit file add text command
            [mysqld] 
            bind-address = your_desired_ip_address
        # save file Ctrl + O, Enter, Ctrl + X
    * sudo systemctl restart mysql


# INSTALL NODEJS
    * sudo apt update
    * sudo apt install nodejs npm -y
        * node -v
        * npm -v

# AUTO RUN NODEJS    
    * sudo apt install build-essential
    * sudo apt update
    * sudo npm install -g pm2
        * pm2 -v
        * pm2 start app.js -i 3
        * pm2 startup
        * sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u engineer --hp /home/engineer
        * pm2 list
        * pm2 save
    * sudo reboot
    
# INSTALL NODEJS IN PROJECT
    # open terminal on directory
    * mkdir iot-polipharm
    * cd iot-polipharm
    * nano iot-api.js
    * npm innit
    * npm i express nodemon cors mysql2
    * nano package.json
        *********************************************************************
        *    "scripts": {                                                   *
        *        "test": "echo \"Error: no test specified\" && exit 1",     *
        *        "start": "node iot-api.js",                                *
        *        "dev": "nodemon iot-api.js"                                *
        *    },                                                             *
        *********************************************************************
    * npm run dev
    * npm start

# COMMAND LINUX
    * ls  == list
    * cd dir  == open dir
    * mkdir dir  == create dir
    * nano filename.txt
        - Ctrl O, Enter == save file
        - Ctrl x, Enter == Exit
    * rm filename.txt  == remove file
    * rm -r dirname  == remove dirname

# COMMAND LINUX
    ls - List Files and Directories:    ใช้สำหรับแสดงรายชื่อไฟล์และไดเรกทอรีในไดเรกทอรีปัจจุบัน.
        ตัวอย่าง: ls

    cd - Change Directory:  ใช้เพื่อเปลี่ยนไปยังไดเรกทอรีอื่น.
        ตัวอย่าง: cd directory_name
        
    pwd - Print Working Directory:  แสดงที่อยู่ของไดเรกทอรีปัจจุบัน.
        ตัวอย่าง: pwd

    mkdir - Make Directory: ใช้สำหรับสร้างไดเรกทอรีใหม่.
        ตัวอย่าง: mkdir directory_name

    touch - Create Empty File:  ใช้สำหรับสร้างไฟล์ว่าง.
        ตัวอย่าง: touch file_name

    cp - Copy:  ใช้สำหรับคัดลอกไฟล์หรือไดเรกทอรี.
        ตัวอย่าง: cp source destination

    mv - Move or Rename:    ใช้สำหรับย้ายไฟล์หรือไดเรกทอรีหรือเปลี่ยนชื่อไฟล์หรือไดเรกทอรี.
        ตัวอย่าง: mv source destination
        ตัวอย่าง: mv * dir

    rm - Remove:    ใช้สำหรับลบไฟล์หรือไดเรกทอรี.
        ตัวอย่าง: rm file_name (ลบไฟล์), rm -r directory_name (ลบไดเรกทอรี)
        ตัวอย่าง: mv * dir

    chmod - Change Permissions:     ใช้สำหรับเปลี่ยนสิทธิ์การเข้าถึงไฟล์หรือไดเรกทอรี.
        ตัวอย่าง: chmod permissions file_name

    chown - Change Owner:   ใช้สำหรับเปลี่ยนเจ้าของของไฟล์หรือไดเรกทอรี.
        ตัวอย่าง: chown new_owner file_name

    find - Find Files:  ใช้สำหรับค้นหาไฟล์หรือไดเรกทอรีในระบบ.
        ตัวอย่าง: find /path/to/search -name "pattern"

# HTTP STATUS CODE
    **1xx (Informational):**
        100 Continue:** เซิร์ฟเวอร์ได้รับส่วนหนึ่งของร้องขอและต้องการรับส่วนที่เหลือเพิ่มเติมจากไคลเอนต์ แสดงว่าการดำเนินการสามารถดำเนินการต่อไปได้.

    **2xx (Successful):**
        200 OK:** ร้องขอได้รับการประมวลผลเรียบร้อยและสำเร็จ.
        201 Created:** ข้อมูลได้ถูกสร้างขึ้นเรียบร้อยแล้ว, เช่นเมื่อสร้างทรัพยากรใหม่.
        204 No Content:** ร้องขอได้รับการประมวลผลเรียบร้อย แต่ไม่มีข้อมูลเพิ่มเติมที่ต้องส่งกลับ.

    **3xx (Redirection):**
        301 Moved Permanently:** ที่อยู่ URL ได้เปลี่ยนแปลงถาวรและถูกนำไปยังที่อยู่ใหม่.
        302 Found (Moved Temporarily):** ที่อยู่ URL ได้เปลี่ยนแปลงชั่วคราวและถูกนำไปยังที่อยู่ใหม่.
        304 Not Modified:** ข้อมูลยังไม่เปลี่ยนแปลงตามเวอร์ชันที่กำหนดไว้, ทำให้เครื่องลูกข่ายสามารถใช้งานข้อมูลที่ถูกเก็บไว้ในแคชได้.

    **4xx (Client Error):**
        400 Bad Request:** ร้องขอมีคำขอไม่ถูกต้องหรือไม่สามารถเข้าใจได้.
        401 Unauthorized:** คำขอต้องการการรับรองตัวตนก่อนใช้งาน.
        403 Forbidden:** คำขอถูกปฏิเสธเนื่องจากสิทธิ์การเข้าถึง.
        404 Not Found:** ไม่พบข้อมูลตามที่ร้องขอ.
        405 Method Not Allowed:** วิธีการที่ร้องขอไม่ได้รับอนุญาตสำหรับทรัพยากรนี้.

    **5xx (Server Error):**
        500 Internal Server Error:** เซิร์ฟเวอร์พบข้อผิดพลาดภายในขณะที่กำลังประมวลผลคำขอ.
        501 Not Implemented:** การดำเนินการไม่ได้รับการสนับสนุนหรือไม่ได้ถูกนำมาใช้งานในเซิร์ฟเวอร์.
        502 Bad Gateway:** เซิร์ฟเวอร์ที่เป็นพนักงานกลาง (Gateway) ไม่สามารถรับคำขอไปยังเซิร์ฟเวอร์หลักได้.
        503 Service Unavailable:** เซิร์ฟเวอร์ไม่สามารถให้บริการคำขอได้ในขณะนี้ เนื่องจากการซ่อมบำรุงหรือปัญหาอื่น ๆ.
        504 Gateway Timeout:** เซิร์ฟเวอร์ที่เป็นพนักงานกลางไม่ได้รับการตอบสนองภายในระยะเวลาที่กำหนด.



