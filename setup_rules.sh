#!/bin/sh

RULES_FILE=/usr/lib/udev/rules.d/42-flipperzero.rules
RULES_TEXT='#Flipper Zero serial port\n
            SUBSYSTEMS=="usb", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="5740", ATTRS{manufacturer}=="Flipper Devices Inc.", TAG+="uaccess"\n
            #Flipper Zero DFU\n
            SUBSYSTEMS=="usb", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="df11", ATTRS{manufacturer}=="STMicroelectronics", TAG+="uaccess"\n'

warning_message() {
    echo "You will now be prompted for SUDO password."
}

rules_install() {
    warning_message

    sudo -K &&
    # The danger zone
    echo -e $RULES_TEXT | sudo tee $RULES_FILE > /dev/null &&
    sudo udevadm control --reload-rules &&
    sudo udevadm trigger
    # End of danger zone

    if [ $? -eq 0 ]; then
        echo "Device rules have been installed successfully. You're good to go!."
    else
        echo "Something went wrong. Device rules may have not been installed correctly."
    fi
}

rules_uninstall() {
    if [ -f $RULES_FILE ]; then
        warning_message

        sudo -K &&
        # The danger zone
        sudo rm -rf $RULES_FILE &&
        sudo udevadm control --reload-rules &&
        sudo udevadm trigger &&
        # End of danger zone

        if [ $? -eq 0 ]; then
            echo "Device rules have been uninstalled successfully. Thank you."
        else
            echo "Something went wrong. Device rules may have not been uninstalled correctly."
        fi

    else
        echo "Nothing to uninstall. Bye!"
    fi
}

clear
echo "This script will install system rules that will enable communication with your Flipper Zero."

while true
do
    read -p "Choose what to do: [I]nstall, [U]ninstall or [E]xit: " CHOICE
    case $CHOICE in
        [Ii]* ) rules_install; break;;
        [Uu]* ) rules_uninstall; break;;
        [Ee]* ) echo "Bye!"; exit;;
        * ) echo "Please enter one of the letters: I, U or E.";;
    esac
done
