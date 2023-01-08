const request = require('request');
const figlet = require('figlet');
const lolcatjs = require('lolcatjs');
const readline = require('readline');
const clui = require('clui');
//mke a function to clear the screen
const clear = require('clear');
const Spinner = clui.Spinner;
const Gauge = clui.Gauge;
const Menu = clui.Menu;


// Replace TOKEN with your GitHub personal access token
const token = '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';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display a fancy greeting message with figlet using the cosmic font
// the lolcatjs library to display the text in rainbow colors
clear();
lolcatjs.fromString(
  figlet.textSync('LazyGit', {
    font: 'cosmic'
  })
);


// Get the list of repositories for the authenticated user
let repoLinks = [];

const getRepos = () => {
  const status = new Spinner('Fetching repository list...');
  status.start();

  request({
    url: 'https://api.github.com/user/repos',
    headers: {
      'Authorization': 'Bearer ' + token,
      'User-Agent': 'MyApp'
    }
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Parse the JSON response
      const repos = JSON.parse(body);
      status.stop();
      
      // Display a menu of repository options
      const Table = require('cli-table3');
      const chalk = require('chalk');

      // create table with colored headings and styled cells
      const table = new Table({
        head: [chalk.green('Number'), chalk.green('Repository Name')],
        colWidths: [10, 40],
        style: {
          head: ['green'],
          cell: ['cyan']
        }
      });

      repos.forEach((repo, index) => {
        table.push([index + 1, repo.name]);
      });

      console.log(table.toString());

      // Prompt the user to select a repository
      rl.question('Select a repository by number: ', (input) => {
        const selectedIndex = parseInt(input.trim()) - 1;
        const selectedRepo = repos[selectedIndex];
        displayMenu(selectedRepo);
      });

      repoLinks = repos.map((repo, index) => {
        //remove the https:// with nothing and the /repo with nothing
        return {
          link: repo.url.replace('https://api.', '').replace('/repos', '')+ '.git',
          index: index + 1
        };
      });
      
    }
  });
};

getRepos()
//log the repo links
console.log(repoLinks);






const displayMenu = (repo) => {
  // require the Table and chalk libraries
  const Table = require('cli-table3');
  const chalk = require('chalk');

  // create a new table with colored headings and styled cells
  const table = new Table({
    head: [chalk.green('Option'), chalk.green('Description')],
    colWidths: [10, 40],
    style: {
      head: ['green'],
      cell: ['cyan']
    }
  });

  table.push(
    ['1', 'Clone Repository'],
    ['2', 'View Commits'],
    ['3', 'Create New Branch'],
    ['4', 'Create New Repository']
  );

  console.log(table.toString());

  rl.question('\nSelect an option by number: ', (input) => {
    const selectedOption = parseInt(input.trim());
    clearScreen();

    switch (selectedOption) {
      case 1:
        cloneRepo(repo.html_url);
        displayMenu(repo);
        break;
      case 2:
        viewCommits();
        break;
      case 3:
        createBranch();
        break;
      case 4:
        createRepo();
        break;
      default:
        console.log('Invalid option selected. Please try again.');
        displayMenu(repo);
    }
  });
};

//Main functions

//clone the repo
const cloneRepo = (repoLink) => {
  const status = new Spinner('Cloning repository...');
  status.start();
  const exec = require('child_process').exec;
  const cmd = `git clone https://${token}@${repoLink.replace('https://', '')}`;


  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error}`);
      return;
    }
    status.stop();
    //using figlet and lolcatjs to display the text in rainbow colors, tell the user that the repo was cloned successfully
    clearScreen();
    lolcatjs.fromString(
      figlet.textSync('I cloned the repo', {
        font: 'cosmic'
      })
    );

    displayMenu();
  });
}

//clear the screen and display the figlet text
const clearScreen = () => {
  clear();
  lolcatjs.fromString(
    figlet.textSync('LazyGit', {
      font: 'cosmic'
    })
  );
};

//view the commits
const viewCommits = (repo) => {
  // Use the repo parameter to access the repository object
  const status = new Spinner('Fetching commit history...');
  status.start();

  request({
    url: `https://api.github.com/repos/${repo.full_name}/commits`,
    headers: {
      'Authorization': 'Bearer ' + token,
      'User-Agent': 'MyApp'
    }
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      // Parse the JSON response
      const commits = JSON.parse(body);
      status.stop();

      // Display the commit history in a table
      const Table = require('cli-table3');
      const chalk = require('chalk');

      // create a new table with colored headings and styled cells
      const table = new Table({
        head: [chalk.green('Commit'), chalk.green('Author'), chalk.green('Date')],
        colWidths: [10, 20, 20],
        style: {
          head: ['green'],
          cell: ['cyan']
        }
      });

      commits.forEach((commit) => {
        table.push([commit.sha.substring(0, 7), commit.commit.author.name, commit.commit.author.email]);
      });

      console.log(table.toString());
      rl.question('\nPress Enter to continue: ', () => {
        clearScreen();
        displayMenu(repo);
      });
    }
  });
};

