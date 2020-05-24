import Web3 from "web3";
import { abi } from "utils/abi";
import { USER_TYPE } from "utils/enum";
var web3 = window.web3;
function get(n) {
  if (!n.c) {
    return n;
  }
  return n.c[0] * n.s;
}

export function get_client_list(callback, myContract = window.myContract) {
  const client_list = [];
  myContract.total_valid_clients.call(function(error, result) {
    if (error) {
      // alert("Error: Was not able to communicate with contract");
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
      console.log(error);
    } else {
      var number_of_clients = result;
      if (number_of_clients == 0) callback(false, client_list);
      for (var i = 0; i < number_of_clients; i++) {
        myContract.valid_client_list.call(
          i,
          {
            from: window.account,
            gas: 4200000,
          },
          function(error, result) {
            console.log("end");
            console.log("object", result, result.substring(2, 5));
            client_list.push(result);
            if (i == number_of_clients) {
              callback(false, client_list);
            }
            // document.getElementById("clientlists").innerHTML += "<li>" + 'id: Account'+result.substring(2,5)+'-'+result + "</li>";
          }
        );
      }
    }
  });
}

export function get_validator_list(callback, myContract = window.myContract) {
  const client_list = [];

  myContract.total_valid_validators.call(function(error, result) {
    if (error) {
      // alert("Error: Was not able to communicate with contract");
      console.log(error);
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
    } else {
      var number_of_clients = result;
      if (number_of_clients == 0) callback(false, client_list);
      for (var i = 0; i < number_of_clients; i++) {
        myContract.valid_validators_list.call(
          i,
          {
            from: window.account,
            gas: 4200000,
          },
          function(error, result) {
            console.log("end");
            console.log("object", result, result.substring(2, 5));
            client_list.push(result);
            if (i == number_of_clients) {
              callback(false, client_list);
            }
            // document.getElementById("clientlists").innerHTML += "<li>" + 'id: Account'+result.substring(2,5)+'-'+result + "</li>";
          }
        );
      }
    }
  });
}

export function get_admin_list(callback, myContract = window.myContract) {
  const client_list = [];
  myContract.total_valid_admins.call(function(error, result) {
    if (error) {
      // alert("Error: Was not able to communicate with contract");
      console.log(error);
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
    } else {
      var number_of_clients = result;
      if (number_of_clients == 0) callback(false, client_list);
      for (var i = 0; i < number_of_clients; i++) {
        myContract.valid_admins_list.call(
          i,
          {
            from: window.account,
            gas: 4200000,
          },
          function(error, result) {
            console.log("end");
            console.log("object", result, result.substring(2, 5));
            client_list.push(result);
            if (i == number_of_clients) {
              callback(false, client_list);
            }
            // document.getElementById("clientlists").innerHTML += "<li>" + 'id: Account'+result.substring(2,5)+'-'+result + "</li>";
          }
        );
      }
    }
  });
}

export function register_client(
  client_address,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var client_addr = client_address;
  if (client_addr == "") {
    // document.getElementById("regaddrres").innerHTML = "All fields must be filled in!";
    console.log("err");
    return;
  }

  myContract.total_valid_clients.call(function(error, result) {
    if (error) {
      // alert("Error: Was not able to communicate with contract :(");
      console.log(error);
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
    } else {
      var number_of_clients = result;

      for (let i = 0; i < number_of_clients; i++) {
        myContract.valid_client_list.call(
          i,
          {
            from: account,
            gas: 4200000,
          },
          function(error, result) {
            if (
              client_addr.toString().toLowerCase() ==
              result.toString().toLowerCase()
            ) {
              callback({
                message:
                  "The address has been registered! Please choose a new one!",
              });
            }
          }
        );
      }
    }
  });

  //to do
  myContract.register_client(
    client_addr,
    {
      from: account,
      gas: 4200000,
    },
    function(error, result) {
      if (error) {
        callback({ message: "Error: Transaction has not been sent" });
        console.log(error);
      } else {
        callback(false);
        console.log("Student address registered at " + result);
      }
    }
  );
}

export function register_validator(
  validator_addr,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  if (validator_addr == "") {
    return;
  }

  myContract.valid_validators.call(
    validator_addr,
    {
      from: account,
      gas: 4200000,
    },
    function(error, result) {
      console.log("validator result, ------", result, !result);
      if (error) {
        console.log(error);
        callback({
          message: "Error: Was not able to retrieve details of your account",
        });
      }
      if (!result) {
        myContract.register_validator(
          validator_addr,
          {
            from: account,
            gas: 4200000,
          },
          function(error, result) {
            if (error) {
              callback({ message: "Error: Transaction has not been sent" });
              console.log(error);
            } else {
              console.log("Student address registered at " + result);
              callback(false);
            }
          }
        );
      } else {
        callback(true);
        callback({
          message: "Error: The Validator has already been registered!",
        });
      }
    }
  );
}

export function check_organization(
  callback,
  myContract = window.myContract,
  account = window.account
) {
  setTimeout(() => {
    myContract.valid_organizations.call(
      account || window.web3.eth.accounts[0],
      {
        from: account,
        gas: 4200000,
      },
      function(error, result) {
        // alert(user.account);
        // 　alert(result[2]);
        // alert(result);
        if (result) {
          console.log("right");
          callback(false);
        } else {
          callback(true);
          // alert("Only valid owner can login! Please register first!");
        }
      }
    );
  }, 101);
}

export function check_client(
  callback,
  myContract = window.myContract,
  account = window.account
) {
  // alert(user.account);
  // var user = user.account;
  // var s = user.toString();

  try {
    setTimeout(() => {
      myContract.valid_clients.call(
        account || window.web3.eth.accounts[0],
        {
          from: account,
          gas: 4200000,
        },
        function(error, result) {
          // alert(user.account);
          // 　alert(result[2]);
          if (result && result[2]) {
            callback(false);
          } else {
            callback(true);

            // alert("Only valid client can login! Please register first!");
          }
        }
      );
    }, 101);
  } catch (error) {
    console.log(error, "error");
  }
}

export function check_validators(
  callback,
  myContract = window.myContract,
  account = window.account
) {
  console.log("check_validators", account);
  // if (account) {
  setTimeout(() => {
    myContract.valid_validators.call(
      account || window.web3.eth.accounts[0],
      {
        from: account,
        gas: 4200000,
      },
      function(error, result) {
        // alert(result);
        if (result) {
          callback(false);
        } else {
          callback(true);
          // alert("Only valid validators can login! Please register first!");
        }
      }
    );
  }, 101);
  // }
}

export function format_hashes(hash) {
  if (typeof hash !== "string") {
    hash = hash.toString();
  }
  if (hash.substring(0, 2) !== "0x") {
    hash = "0x" + hash.trim();
  }
  return hash;
}

export function insert_age(
  age,
  hash,
  validator,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var age = format_hashes(age);
  var hash_of_file = format_hashes(hash);

  // address of validators
  var val_address1 = validator[0] && validator[0].toString().trim();
  if (!val_address1) {
    val_address1 = "0x0000000000000000000000000000000000000000";
  }
  var val_address2 = validator[1] && validator[1].toString().trim();
  if (!val_address2) {
    val_address2 = "0x0000000000000000000000000000000000000000";
  }
  var val_address3 = validator[2] && validator[2].toString().trim();
  if (!val_address3) {
    val_address3 = "0x0000000000000000000000000000000000000000";
  }
  var val_address4 = validator[3] && validator[3].toString().trim();
  if (!val_address4) {
    val_address4 = "0x0000000000000000000000000000000000000000";
  }

  var missing_fields = false;
  if (age == "0x") {
    // document.getElementById("ageval").innerHTML = "Age field must be filled in!<br>";
    missing_fields = true;
  }
  if (hash_of_file == "0x") {
    // document.getElementById("ageval").innerHTML = "File hash field must be filled in!<br>";
    missing_fields = true;
  }
  if (!val_address1 && !val_address2 && !val_address3 && !val_address4) {
    // document.getElementById("ageval").innerHTML = "You must supply an address for at least one validator!";
    missing_fields = true;
  }
  if (missing_fields) {
    callback(true);
    return;
  }

  myContract.insert_age(
    age,
    hash_of_file,
    val_address1,
    val_address2,
    val_address3,
    val_address4,
    {
      from: account,
      gas: 4200000,
    },
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to insert the invalid age")
        callback(true);
        console.log(error);
      } else {
        // document.getElementById("ageval").innerHTML = "The encrypted age is " + age + "."
        callback(false);
      }
    }
  );
}

export function findAge(
  client,
  encrptedAge,
  encrptedProofOfAge,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  // function finds the client's record of their age on the contract, and displays
  // some extra html to allow the validator to post their approval
  var client_address = format_hashes(client);
  var hashed_client_age = format_hashes(encrptedAge);

  var hashed_client_age_doc = format_hashes(encrptedProofOfAge);
  console.log(client_address, hashed_client_age, hashed_client_age_doc);
  //console.log(client_address + hashed_client_age);
  // Call to contract for confirmation of client age
  myContract.find_age.call(
    client_address,
    hashed_client_age,
    hashed_client_age_doc,
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to communicate with contract :(");
        callback(true);
      } else {
        // contract returns a boolean value - True if client address is associated with the age given, else False
        if (result) {
          callback(false, { exist: true });
        } else {
          callback(false, { exist: false });
        }
      }
    }
  );
}

export function approveAge(
  client,
  approval,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var client_address = client;

  var res = format_hashes(approval);
  console.log("approveAge", client_address, res);
  myContract.validate_age(client_address, res, function(error, result) {
    if (error) {
      // alert("Error: Was not able to communicate with contract :(");
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
      console.log("approveAge", error);
    } else {
      // document.getElementById("ageconf").innerHTML = "Valdiation registered on the contract";
      callback(false);
    }
  });
}

export function approveDegree(
  client,
  approval,
  index,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var client_address = client.toString();
  var res = format_hashes(approval);
  var indx = index;
  //alert(indx);
  console.log(client_address + " " + res + " " + indx);
  myContract.validate_degree(client_address, res, indx, function(
    error,
    result
  ) {
    if (error) {
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
      console.log(error);
    } else {
      callback(false);
    }
  });
}

export function approveLicense(
  client,
  approval,
  index,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var client_address = client;
  var res = format_hashes(approval);
  var indx = index;
  console.log(client_address + " " + res + " " + indx);
  myContract.validate_license(client_address, res, indx, function(
    error,
    result
  ) {
    if (error) {
      console.log(error);
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
    } else {
      callback(false);
    }
  });
}

export function insert_degree(
  encryptedDegree,
  encryptedDescription,
  encryptedProofOfDegree,
  validator,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var degree = format_hashes(encryptedDegree);
  var description = format_hashes(encryptedDescription);
  var hash_of_file = format_hashes(encryptedProofOfDegree);

  // address of validators
  var val_address1 = validator[0] && validator[0].toString().trim();
  if (!val_address1) {
    val_address1 = "0x0000000000000000000000000000000000000000";
  }
  var val_address2 = validator[1] && validator[1].toString().trim();
  if (!val_address2) {
    val_address2 = "0x0000000000000000000000000000000000000000";
  }
  var val_address3 = validator[2] && validator[2].toString().trim();
  if (!val_address3) {
    val_address3 = "0x0000000000000000000000000000000000000000";
  }
  var val_address4 = validator[3] && validator[3].toString().trim();
  if (!val_address4) {
    val_address4 = "0x0000000000000000000000000000000000000000";
  }

  var missing_fields = false;
  if (degree == "0x") {
    // document.getElementById("degreeval").innerHTML = "Degree field must be filled in!<br>";
    missing_fields = true;
  }
  if (description == "0x") {
    // document.getElementById("degreeval").innerHTML = "Degree description field must be filled in!<br>";
    missing_fields = true;
  }
  if (hash_of_file == "0x") {
    // document.getElementById("degreeval").innerHTML = "File hash field must be filled in!<br>";
    missing_fields = true;
  }
  if (!val_address1 && !val_address2 && !val_address3 && !val_address4) {
    // document.getElementById("degreeval").innerHTML = "You must supply an address for at least one validator!";
    missing_fields = true;
  }
  if (missing_fields) {
    return;
  }

  console.log(
    degree,
    description,
    hash_of_file,
    val_address1,
    val_address2,
    val_address3,
    val_address4
  );
  myContract.insert_degree(
    degree,
    description,
    hash_of_file,
    val_address1,
    val_address2,
    val_address3,
    val_address4,
    {
      from: account,
      gas: 4200000,
    },
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to insert the invalid degree")
        console.log(error);
        callback(true);
      } else {
        // document.getElementById("degreeval").innerHTML = "The current degree is " + degree + "."
        callback(false);
      }
    }
  );
}

export function insert_license(
  encryptedLicense,
  encryptedDate,
  encryptedDescription,
  encryptedProofOfLicense,
  validator,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var license = format_hashes(encryptedLicense);
  var description = format_hashes(encryptedDescription);
  var date = format_hashes(encryptedDate);
  var hash_of_file = format_hashes(encryptedProofOfLicense);

  // address of validators
  var val_address1 = validator[0] && validator[0].toString().trim();
  if (!val_address1) {
    val_address1 = "0x0000000000000000000000000000000000000000";
  }
  var val_address2 = validator[1] && validator[1].toString().trim();
  if (!val_address2) {
    val_address2 = "0x0000000000000000000000000000000000000000";
  }
  var val_address3 = validator[2] && validator[2].toString().trim();
  if (!val_address3) {
    val_address3 = "0x0000000000000000000000000000000000000000";
  }
  var val_address4 = validator[3] && validator[3].toString().trim();
  if (!val_address4) {
    val_address4 = "0x0000000000000000000000000000000000000000";
  }

  var missing_fields = false;
  if (license == "0x") {
    // document.getElementById("licenseval").innerHTML = "License field must be filled in!<br>";
    missing_fields = true;
  }
  if (description == "0x") {
    // document.getElementById("licenseval").innerHTML = "License description field must be filled in!<br>";
    missing_fields = true;
  }
  if (date == "0x") {
    // document.getElementById("licenseval").innerHTML = "Date field must be filled in!<br>";
    missing_fields = true;
  }
  if (hash_of_file == "0x") {
    // document.getElementById("licenseval").innerHTML = "File hash field must be filled in!<br>";
    missing_fields = true;
  }
  if (!val_address1 && !val_address2 && !val_address3 && !val_address4) {
    // document.getElementById("licenseval").innerHTML = "You must supply an address for at least one validator!";
    missing_fields = true;
  }
  if (missing_fields) {
    return;
  }

  console.log(
    license,
    description,
    date,
    hash_of_file,
    val_address1,
    val_address2,
    val_address3,
    val_address4
  );
  myContract.insert_license(
    license,
    description,
    date,
    hash_of_file,
    val_address1,
    val_address2,
    val_address3,
    val_address4,
    {
      from: account,
      gas: 4200000,
    },
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to insert the invalid degree")
        console.log(error);
        callback(true);
      } else {
        callback(false);
      }
    }
  );
}

export function findDegree(
  client,
  encryptedDegree,
  encryptedDescription,
  encryptedProofOfDegree,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  // function finds the client's record of their degree on the contract, and displays
  // some extra html to allow the validator to post their approval
  var client_address = format_hashes(client);
  var hashed_client_degree = format_hashes(encryptedDegree);
  var hashed_client_degdes = format_hashes(encryptedDescription);
  var hashed_client_deg_doc = format_hashes(encryptedProofOfDegree);
  //console.log(client_address + hashed_client_degree + hashed_client_degdes);
  // Call to contract for confirmation of client degree
  myContract.find_degree_index.call(
    client_address,
    hashed_client_degree,
    hashed_client_degdes,
    hashed_client_deg_doc,
    function(error, result) {
      if (error) {
        alert("Error: Was not able to communicate with contract :(");
        console.log(error);
      } else {
        // contract returns an array in which 0th element is boolean -
        // True if client address is associated with the age given, else False
        if (result[0]) {
          //alert('Degree CONFIRMED');
          callback(false, { exist: true, index: get(result[1]) });
          // 1st element is the index of the degree on the contract
          // document.getElementById("degindx").innerHTML = get(result[1]);
        } else {
          callback(false, { exist: false });
        }
      }
    }
  );
}

export function findLicense(
  client,
  encryptedLicense,
  encryptedDescription,
  encryptedDate,
  encryptedProofOfLicense,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  // function finds the client's record of their license on the contract, and displays
  // some extra html to allow the validator to post their approval
  var client_address = format_hashes(client);
  var hashed_client_license = format_hashes(encryptedLicense);
  var hashed_client_licdes = format_hashes(encryptedDescription);
  var hashed_client_licexpdate = format_hashes(encryptedDate);
  var hashed_client_lic_doc = format_hashes(encryptedProofOfLicense);
  //console.log(client_address + hashed_client_license + hashed_client_licdes + hashed_client_licexpdate);
  // Call to contract for confirmation of client license
  console.log(
    client_address,
    hashed_client_license,
    hashed_client_licdes,
    hashed_client_licexpdate,
    hashed_client_lic_doc
  );
  myContract.find_license_index.call(
    client_address,
    hashed_client_license,
    hashed_client_licdes,
    hashed_client_licexpdate,
    hashed_client_lic_doc,
    function(error, result) {
      if (error) {
        alert("Error: Was not able to communicate with contract :(");
        console.log(error);
      } else {
        console.log(result);
        // contract returns an array in which 0th element is boolean -
        // True if client address is associated with the age given, else False
        if (result[0]) {
          callback(false, { exist: true, index: get(result[1]) });
        } else {
          callback(false, { exist: false });
        }
      }
    }
  );
}

export function confirmAge(
  client,
  encryptedAge,
  encryptedProofOfAge,
  callback,
  myContract = window.myContract
) {
  var addr = client;
  var cryptage = format_hashes(encryptedAge);
  var cryptfile = format_hashes(encryptedProofOfAge);
  console.log(addr, cryptage, cryptfile);
  myContract.find_age.call(addr, cryptage, cryptfile, function(error, result) {
    if (error) {
      // alert("Error: Was not able to communicate with contract :(");
      console.log(error);
      callback({
        message: "Error: Was not able to communicate with contract :(",
      });
    } else {
      if (result) {
        myContract.determineAmount_toPay_to_ageValidator.call(addr, function(
          error,
          result
        ) {
          if (error) {
            callback({
              message: "Error: Was not able to communicate with contract :(",
            });
            console.log(error);
          } else {
            callback(false, { exist: true, price: result });
          }
        });
      } else {
        callback(false, { exist: false });
      }
    }
  });
}

export function confirmDegree(
  client,
  encryptedDegree,
  encryptedDescription,
  encryptedProofOfDegree,
  callback,
  myContract = window.myContract
) {
  var addr = client;
  var cryptdeg = format_hashes(encryptedDegree);
  var cryptdegdes = format_hashes(encryptedDescription);
  var cryptfile = format_hashes(encryptedProofOfDegree);
  console.log(addr + " " + cryptdeg + " " + cryptdegdes);
  myContract.find_degree_index.call(
    addr,
    cryptdeg,
    cryptdegdes,
    cryptfile,
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to communicate with contract :(");
        console.log(error);
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
      } else {
        console.log(result);
        if (result[0]) {
          console.log("A thing happened: " + result);
          var indx = get(result[1]);
          myContract.determineAmount_toPay_to_degreeValidator.call(
            addr,
            indx,
            function(error, result) {
              if (error) {
                callback({
                  message:
                    "Error: Was not able to communicate with contract :(",
                });
                // alert("Error: Was not able to communicate with contract :(");
                console.log(error);
              } else {
                // document.getElementById("degpaymentamount").value = result;
                console.log(
                  "At this point, this should have worked: " + result
                );
                callback(false, { exist: true, index: indx, price: result });
              }
            }
          );
        } else {
          callback(false, { exist: false });
        }
      }
    }
  );
}

export function confirmLicense(
  client,
  encryptedLicense,
  encryptedDescription,
  encryptedDate,
  encryptedProofOfLicense,
  callback,
  myContract = window.myContract
) {
  var addr = client;
  var cryptlic = format_hashes(encryptedLicense);
  var cryptlicdes = format_hashes(encryptedDescription);
  var cryptlicexp = format_hashes(encryptedDate);
  var cryptfile = format_hashes(encryptedProofOfLicense);
  console.log(addr + " " + cryptlic + " " + cryptlicdes + " " + cryptlicexp);
  myContract.find_license_index.call(
    addr,
    cryptlic,
    cryptlicdes,
    cryptlicexp,
    cryptfile,
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to communicate with contract :(");
        console.log(error);
        callback(true);
      } else {
        if (result[0]) {
          var indx = get(result[1]);
          myContract.determineAmount_toPay_to_licenseValidator.call(
            addr,
            indx,
            function(error, result) {
              if (error) {
                // alert("Error: Was not able to communicate with contract :(");
                // console.log(error);
              } else {
                callback(false, { exist: true, index: indx, price: result });
              }
            }
          );
        } else {
          callback(false, { exist: false });
        }
      }
    }
  );
}

export function confirmAgeApproval(
  clientAddress,
  validatorAddress,
  approvalString,
  callback,
  myContract = window.myContract
) {
  var client = format_hashes(clientAddress);
  // if (client === "Ox" || client === "0X") {
  //   document.getElementById("ageapprovalconfirm").innerHTML =
  //     "Please enter client address";
  //   return;
  // }
  var validator = format_hashes(validatorAddress);
  // if (validator === "Ox" || validator === "0X") {
  //   document.getElementById("ageapprovalconfirm").innerHTML =
  //     "Please enter validator address";
  //   return;
  // }
  var approval = format_hashes(approvalString);
  // if (approval === "Ox" || approval === "0X") {
  //   document.getElementById("ageapprovalconfirm").innerHTML =
  //     "Please enter encrypted approval";
  //   return;
  // }
  console.log(client, validator, approval);
  myContract.compare_client_age_verification_res.call(
    client,
    validator,
    approval,
    function(error, result) {
      if (error) {
        // alert("Error: Was not able to communicate with contract :(");
        console.log(error);
        alert(error);
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
      } else {
        if (result) {
          callback(false, { confirmed: true });
        } else {
          callback(false, { confirmed: false });
        }
      }
    }
  );
}

export function confirmDegreeApproval(
  clientAddress,
  validatorAddress,
  approvalString,
  index,
  callback,
  myContract = window.myContract
) {
  var client = format_hashes(clientAddress);
  // if (client === "Ox" || client === "0X") {
  //   document.getElementById("degreeapprovalconfirm").innerHTML =
  //     "Please enter client address";
  //   return;
  // }
  var validator = format_hashes(validatorAddress);
  // if (validator === "Ox" || validator === "0X") {
  //   document.getElementById("degreeapprovalconfirm").innerHTML =
  //     "Please enter validator address";
  //   return;
  // }
  var approval = format_hashes(approvalString);
  // if (approval === "Ox" || approval === "0X") {
  //   document.getElementById("degreeapprovalconfirm").innerHTML =
  //     "Please enter encrypted approval";
  //   return;
  // }
  myContract.compare_client_degree_verification_res.call(
    client,
    validator,
    index,
    approval,
    function(error, result) {
      if (error) {
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
      } else {
        if (result) {
          callback(false, { confirmed: true });
        } else {
          callback(false, { confirmed: false });
        }
      }
    }
  );
}

export function confirmLicenseApproval(
  clientAddress,
  validatorAddress,
  approvalString,
  index,
  callback,
  myContract = window.myContract
) {
  var client = format_hashes(clientAddress);
  // if (client === "Ox" || client === "0X") {
  //   document.getElementById("licenseapprovalconfirm").innerHTML =
  //     "Please enter client address";
  //   return;
  // }
  var validator = format_hashes(validatorAddress);
  // if (validator === "Ox" || validator === "0X") {
  //   document.getElementById("licenseapprovalconfirm").innerHTML =
  //     "Please enter validator address";
  //   return;
  // }
  var approval = format_hashes(approvalString);
  // if (approval === "Ox" || approval === "0X") {
  //   document.getElementById("licenseapprovalconfirm").innerHTML =
  //     "Please enter encrypted approval";
  //   return;
  // }
  // var index;
  // if (!document.getElementById("licindex")) {
  //   document.getElementById("licenseapprovalconfirm").innerHTML =
  //     "Please confirm license has been entered on contract";
  // } else {
  //   index = document.getElementById("licindex").innerHTML;
  // }
  myContract.compare_client_license_verification_res.call(
    client,
    validator,
    index,
    approval,
    function(error, result) {
      if (error) {
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
      } else {
        if (result) {
          callback(false, { confirmed: true });
        } else {
          callback(false, { confirmed: false });
        }
      }
    }
  );
}

export function payForAgeConfirmation(
  price,
  client,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var amt = price;
  var addr = client;
  console.log(amt);
  myContract.pay_validator_of_age(
    addr,
    { from: account, gas: 3000000, value: amt },
    function(error, result) {
      if (error) {
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
        console.log(error);
      } else {
        callback(false, { message: "Paid " + amt + " Wei" });
      }
    }
  );
}

export function payForDegreeConfirmation(
  price,
  client,
  index,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var amt = price;
  var addr = client;
  var indx = index;
  console.log(amt);
  myContract.pay_validator_of_degree(
    addr,
    indx,
    { from: account, gas: 3000000, value: amt },
    function(error, result) {
      if (error) {
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
        console.log(error);
      } else {
        callback(false, { message: "Paid " + amt + " Wei" });
      }
    }
  );
}

export function payForLicenseConfirmation(
  price,
  client,
  index,
  callback,
  myContract = window.myContract,
  account = window.account
) {
  var amt = price;
  var addr = client;
  var indx = index;
  console.log(amt);
  myContract.pay_validator_of_license(
    addr,
    indx,
    { from: account, gas: 3000000, value: amt },
    function(error, result) {
      if (error) {
        callback({
          message: "Error: Was not able to communicate with contract :(",
        });
        console.log(error);
      } else {
        callback(false, { message: "Paid " + amt + " Wei" });
      }
    }
  );
}
