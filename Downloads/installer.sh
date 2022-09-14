#!/bin/bash

#Detecting Arquitecture 
is_arm=0
if uname -m | grep -q "arm" > /dev/null; then is_arm=1; fi

#Easy editable vars
installer_var=$1
wget_debug_flags=""
wget_prod_flgas=""

#DOTNET VARS
#https://dotnet.microsoft.com/download/dotnet-core
		 
arm_dotnet_path="https://download.visualstudio.microsoft.com/download/pr/5a496e41-23da-4aaa-94a7-baa9ab619fc6/0d000727345f3f71858ee79367f6ec23/dotnet-runtime-5.0.4-linux-arm.tar.gz"
arm_dotnet_version="5.0.4"
arm_dotnet_hash=c4ff23491ed49030206b482b8cf229de0d6dc14c64957c8912328eab6c460f5e

x86_dotnet_path="https://download.visualstudio.microsoft.com/download/pr/66db1966-cbe4-4c6c-9e73-80305c555aba/faabab630f9f56e28e9dc30691bda72c/dotnet-runtime-5.0.4-linux-x64.tar.gz"
x86_dotnet_version="5.0.4"
x86_dotnet_hash=33d0918098b8261cb7c95604cc3dd05cc8ea1a79fbcf5630ebc9082adfb2e880

dotnet_installer_path="/opt/dotnet/runtime"

#DMC VARS
install_directory="dmc-installer"
dmc_installer_file="dmc-device-installer.dll"

#Debug mode or not
if [ "$installer_var" = "debug" ]; then
	dmc_site=$2
    wget_debug_flags="--no-check-certificate --quiet"
    dmc_installer_dir=/usr/share/dmc-debug
elif [ "$installer_var" = "staging" ]; then
	dmc_site=$2
    wget_debug_flags="--no-check-certificate --quiet"
    dmc_installer_dir=/usr/share/dmc-staging
else
	dmc_site="https://devicemanagercommand.com"
    wget_prod_flgas="--quiet"
    dmc_installer_dir=/usr/share/dmc
fi

##DMC Linux x64 Vars
if [ $is_arm -eq 0 ]; then
    dmc_installer_file_tar_gz="$dmc_site/api/device/helper/download/linux"  
    dmc_installer_file_tar_gz_hash="$dmc_site/api/device/helper/download/linux-hash"  
else
    dmc_installer_file_tar_gz="$dmc_site/api/device/helper/download/linux-arm"  
    dmc_installer_file_tar_gz_hash="$dmc_site/api/device/helper/download/linux-arm-hash"  
fi

##DMC Linux arm vars
error(){ 
    #printf '\E[31m'; echo "ERROR: $@"; printf '\E[0m' 
	echo "ERROR: $@"; 
}
sucess(){ 
    #printf '\E[32m'; echo "SUCESS: $@"; printf '\E[0m' 
	echo "SUCESS: $@"; 
}
warn(){ 
    #printf '\E[33m'; echo "WARN: $@"; printf '\E[0m' 
	echo "WARN: $@"; 
}
info(){ 
    #printf '\E[34m'; echo "INFO: $@"; printf '\E[0m' 
	echo "$@"; 
}
debug(){ 
    #if [ "$installer_var" = "debug" ]; then printf '\E[35m'; echo "DEBUG: $@"; printf '\E[0m'; fi
	if [ "$installer_var" = "debug" ] ; then  echo "DEBUG: $@"; fi
}


if [ "$installer_var" = "debug" ]; then
    debug "DEBUG: Is ARM = $is_arm" 
fi

#Setting configuration for Arquietecture
dotnet_path=""
if [ $is_arm -eq 1 ]; then
    dotnet_path=$arm_dotnet_path
    dotnet_version=$arm_dotnet_version
    dotnet_hash=$arm_dotnet_hash
else
    dotnet_path=$x86_dotnet_path
    dotnet_version=$x86_dotnet_version
    dotnet_hash=$x86_dotnet_hash
fi

clean(){
    if compgen -G "./*" > /dev/null; then
        rm -R ./$install_directory
    fi
}


info "    ____  __  __  ____ "
info "   |  _ \|  \/  |/ ___|"
info "   | | | | |\/| | |    "
info "   | |_| | |  | | |___ "
info "   |____/|_|  |_|\____|"
info ""
info "Device Manager Command Installer"
info ""

#Root Validation 
if [[ $EUID -ne 0 ]]; then
    warn "You must be root to install"
    exit 1
fi

info "Preparing installer ... "
#Installing packages
if [ $is_arm -eq 1 ]; then
    apt-get install python3-pip -y 2> /dev/null
	pip3 install --upgrade --force-reinstall -q wiringpi
fi

#Dotnet instalation
info "Checking dotnet framework into '$dotnet_installer_path/$dotnet_version'"
dotnet_tar_gz_file="dotnet-runtime-$dotnet_version.tar.gz"

mkdir -p "$dotnet_installer_path/$dotnet_version"
if [ ! -f "$dotnet_installer_path/$dotnet_version/$dotnet_tar_gz_file" ] || [ !  $dotnet_hash = $(sha256sum "$dotnet_installer_path/$dotnet_version/$dotnet_tar_gz_file" | awk '{print $1}') ]; then
    info "Downloading dotnet framework $dotnet_version"
    wget $dotnet_path --content-disposition -q -O $dotnet_tar_gz_file
    mv "$dotnet_tar_gz_file" "$dotnet_installer_path/$dotnet_version/$dotnet_tar_gz_file" #Copy file to version directory

	if [ ! -f "$dotnet_installer_path/$dotnet_version/$dotnet_tar_gz_file" ] || [ ! $dotnet_hash = $(sha256sum "$dotnet_installer_path/$dotnet_version/$dotnet_tar_gz_file" | awk '{print $1}') ]; then
		error "NOT OK Cannot install dotnet framework, try later."
		exit 1
	else
        info "OK Downloadin dotnet framework"       
	fi
else
    info "OK Checking dotnet framework"
fi


rm -Rf "$dotnet_installer_path/$dotnet_version/temp"
mkdir "$dotnet_installer_path/$dotnet_version/temp"
tar xzf "$dotnet_installer_path/$dotnet_version/$dotnet_tar_gz_file" -C "$dotnet_installer_path/$dotnet_version/temp"  #Copy compressed dotnet file if exist to temporal dir
rm -Rf "$dotnet_installer_path/$dotnet_version/bin"  
mv "$dotnet_installer_path/$dotnet_version/temp" "$dotnet_installer_path/$dotnet_version/bin" 
ln -sf "$dotnet_installer_path/$dotnet_version/bin/dotnet" "$dotnet_installer_path/dotnet" 
#DMC Installation

#Downloading files
info "Checking DMC installer"
rm -f installer-hash
debug wget $dmc_installer_file_tar_gz_hash --content-disposition $wget_prod_flgas $wget_debug_flags  -O installer-hash
wget $dmc_installer_file_tar_gz_hash --content-disposition $wget_prod_flgas $wget_debug_flags  -O installer-hash
mkdir -p $dmc_installer_dir

if [ ! -f "$dmc_installer_dir/installer.tar.gz" ] || [[ ! $(cat installer-hash) = *$(sha256sum "$dmc_installer_dir/installer.tar.gz" | awk '{print $1}')* ]]; then
    info "Downloading DMC Installers"
    debug $dmc_installer_file_tar_gz --content-disposition $wget_prod_flgas $wget_debug_flags -O installer.tar.gz
    wget $dmc_installer_file_tar_gz --content-disposition $wget_prod_flgas $wget_debug_flags -O installer.tar.gz
    mv installer.tar.gz $dmc_installer_dir

    if [ -f $dmc_installer_dir/installer.tar.gz ]; then 
        sucess "OK Downloading DMC Installers"
    else
        error "NOT OK Cannot Download DMC Installer, try later"
    fi
else
    info "OK Checking DMC installer"
fi

rm -f installer-hash
rm -Rf "$dmc_installer_dir/temp"
mkdir -p "$dmc_installer_dir/temp"
tar xzf $dmc_installer_dir/installer.tar.gz -C "$dmc_installer_dir/temp"

if [ ! -f "$dmc_installer_dir/temp/$dmc_installer_file" ]; then
    error "NO OK DMC files was not downloaded"
    exit 1
else

    info "Running installer"
    current_dir=$(pwd)
    cd "$dmc_installer_dir/temp"
    debug "$dotnet_installer_path/dotnet $dmc_installer_dir/temp/$dmc_installer_file"
    "$dotnet_installer_path/dotnet" "$dmc_installer_dir/temp/$dmc_installer_file" #Executing installer
    cd $current_dir
fi 
