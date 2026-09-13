# Overview

This repository contains the code for the web assignment portion of the Spark Systems job application. It is a Crypto
tracking/trading app, built using React, Nx, Vite and Redux. Api requests to both my own database/backend logic and
Coinbase power the data displayed.

# Design

From the get go, I decided I wanted the page to be a grid that can be completely customised by the user, with different
widgets for each of the functions that are specified (and not specified when I was done, honestly). This had the
additional benefit of speeding up the time-to-MVP, and allowed me to develop each widget without affecting the layout of
other widgets, and the rest of the site. It did add some complexity, which we will discuss in the challenges section
later.

I also decided it would be good to get the colours of the different Spark Systems logos and corporate art used. No harm
in making it look nice and themed, right? An additional benefit here is that the rest of my personal projects also tend
to feature purple shades a lot, so this project fits right in.

For the backend portion, honestly I am not well versed in PHP at all, so when I saw that the web hosting solution I used
runs the SQL database via PHP, that portion was almost left entirely up to Claude. However, with what I did learn before
in terms of database setup and general good practices, I did make sure that the tables are set up in a way that makes
sense, without overcomplicating the setup.

## Architecture / Project Setup

The app started off running completely using redux states to track current states. I chose redux because given the scope
of the requirements and what I wanted to achieve, there would be a large amount of data, and redux helps to effectively
remove the need for constant prop drilling or finding ways around it. It also helps to cache data from the backend
responses later, allow better performance. This made the process of adding features and widgets much easier. Splicing in
the connections to APIs and further backend are simpler as well.

In general, the project is split into 2 parts, the frontend and backend basically. Focusing on the frontend, I tried to
keep the folder structure clean, by segregating component and logic files first off. I set a hard rule for both myself
and Claude to keep logic within component files under 50 lines, and move logic into a hook file specifically for that
component if that is exceeded. This helped to effectively separate concerns, increasing the readability of both logic
and component files.

To reuse code, I then made sure that any component and logic code used in multiple places are centralised in the common
directory as well.

Finally, tests are places in the src/test folder, with the relative path from the test folder matching that of the
component or logic file being tested's relative path from the src folder. This makes finding the corresponding
test-component/logic file pair much easier, helping speed up debug times. Test writing for every single component or
logic file added was then also easy to confirm, since we just need to ensure its corresponding file is there.

## Grid Design

![Grid](doc_assets/design/grid/grid.png)

For the grid, I wanted something that looks clean, but also clearly signals to the user the layout options that they
have. It begun as a simple display of the cells that widgets would be taken up, with a small amount of spacing and dots
at each of the spacing intersection points to more clearly signify to the user where widgets will go. This has the added
benefit of making the page look very friendly, like a physical piece of paper (the fancy ones with the dotted grid).
Finally, a placeholder to show that a cell is unpopulated lets the user clearly see that that cell is not occupied.

![Edit Mode](doc_assets/design/grid/edit.png) ![Hover Tooltip](doc_assets/design/grid/edit/hover.png)

Doing the grid first also meant that I had to design the edit mode first, which would be necessary to add widgets, and
move them around. Initially, I kept it simple. There would be a button to toggle between edit mode and using mode, with
another button that allows the user to add more widgets in edit mode. We also need the drag action to allow users to
move widgets around. Later on, icons for each widget were added, along with tooltips to explain the function of each
button.

Buttons for pausing live updates and adjusting update delay were added too. These were originally going to be edit mode
only, but I decided that they should be in the using mode as well, since they tend to be more spur of the moment
decisions from users, and gating it beyond additional actions makes no sense. Editing layout and widgets present is a
more disruptive and intentional decision, so we do not want users to accidentally trigger those actions while trying to
just use the application.

Finally, we add the ability for user to add widgets in 2 ways:

1. add a widget in first empty slot by clicking widget button
2. add a widget in specific location by dragging widget button out onto the grid

The second action is just a nice to have :)

![Widget](doc_assets/design/grid/widget.png)

For the added widgets in edit mode, edit and delete buttons on each widget were used to, well, edit and delete added
widgets. Beyond the initial features, later on we had larger widgets, which can be resized to allow more data to display
per widget. This necessicated a way to resize the widgets, which I accomplished using little bars in the padding of the
widgets. Code wise, this necessitated a minimum size gate for certain widgets that would look off when resized too much,
along with snapping to prevent sub-grid sizes of widgets.

### Edit Mode: Instrument Widget

![Instrument Widget Edit](doc_assets/design/grid/edit/instrument.png)

For the instrument widget, we can simply search for a instrument to track, and either confirm to set it as the tracked
instrument, or cancel to not change the value. By default, the BTC-USD value is populated.

### Edit Mode: Watchlist Widget

![Watchlist Widget Edit](doc_assets/design/grid/edit/watchlist.png)

For the watchlist widget, we can edit both the name of the watchlist and items in the watchlist. Each item in the
watchlist has 3 actions: reorder, edit and delete. At the bottom of the list, there is an empty text field to add more
instruments to the watchlist.

### Edit Mode: Orders Widget

The orders widget does not have anything to edit in edit mode other than its size and deleting it for now, so that's all
we have.

## Widget Design: Instrument

### Unexpanded View

The first widget I made was the lowest hanging fruit: the single instrument tracker. It is a 1x1 widget that tracks (as
its name suggests) a single instrument.

![Instrument Widget Title](doc_assets/design/instrumentWidget/title.png)

To keep things simple, we start with just the title and last updated time at the top, letting the user know which
instrument is being tracked and how fresh the data is, which I figure would be important to users. Finally, a button on
the right of the title allows users to expand the widget to view more information about the instrument in a pop up
dialog.

![Instrument Widget Content](doc_assets/design/instrumentWidget/content.png)

The content in the unexpanded widget should be kept brief, since this widget takes up the least space. However, we try
to display as much data as possible in this space. To this end, we have current prices displayed here for both bid and
ask, as well as the price and size of the last trade of the instrument. To pack more data, we even coloured the cell
that the last trade size value sits in according to whether the last trade was a buy or sell. Finally, we have the buy
and sell buttons at the top of this panel, which is the main purpose of the single instrument widget: to allow users to
really focus on this more important instrument and be able to buy and sell it as fast as possible.

![Instrument Widget Flash](doc_assets/design/instrumentWidget/flash.png)

After the basic functionality of the widget was completed, it was time to add some (really useful) flair. I realised
that it was difficult to tell when new values appeared, since the text is not exactly huge. Given that this widget is
for the user to really focus on specific important instruments, something that unmistakeably alerts users to changes in
values would be preferred. Inspired by the flashing effects on other aggregator websites when fresh instrument data
comes in, I did a similar effect, themed to our website's colours and fading out after a while to also give a visual
indicator of how long it has been since the previous update.

### Expanded View

![Instrument Widget Expanded](doc_assets/design/instrumentWidget/expanded.png)

For users who want to see more information about the specific instrument, we then have the expanded version of the
widget that appears when the user clicks on the expand icon, or anywhere on the widget that is not the buy/sell buttons.
This brings up a larger pop up that shows more information, and stops ticking instruments that are being tracked in
other widgets, allowing the user to fully focus on the data in this widget and saving on performance. A blur is also
applied over the background to prevent distractions.

## Widget Design: Watchlist

![Watchlist Widget](doc_assets/design/watchlistWidget/widget.png)

Not every instrument is as important, of course. Some users may also be more able to handle a denser information load at
once, so we have our second widget, the watchlist. This widget is used to track as many widgets as the user wants at
once, so long as it fits on screen. To save space, I compressed the data points displayed in the singular instrument
widget down to a single row, and let the rows pulse when updates come in. The space for the labels is also saved, by
having a single header row for the whole table. Thus, much more data can be fit into the same area. Last refresh time is
now a single value for the whole watchlist, since the user can see the most purple item to tell which item it was that
updated, and all the other data would be accurate to that time with how the websocket connection works. Clicking on a
row will also allow the user to open up the same expanded details panel that you can access by clicking on the single
instrument widget.

Initially, I allowed the watchlist to scroll if the user adds to many items to display in the height of the widget.
However, this not only uses up more bandwidth for instruments that the user can't even see yet, and also does not feel
elegant. Instead, we have the number of total items in the watchlist appended to the title, and have a pagination
element at the bottom for users to move between pages of the watchlist to see more instruments. Finally, we lock the
widths of the columns instead of allowing them to hug the contents, so the table does not continually shift around as
new data with different value lengths come in.

## Widget Design: Orders

![Order Widget](doc_assets/design/orderWidget/widget.png)

The final widget completed was the order widget. This widget is used to display all orders tied to the user account. Of
course, these are not real. But for some semblance of realism, I will cover the barebones "order fulfilling" server in a
later section. The main content in this widget is the orders table. Each row displays all the data points we filled in
the order form, along with more data points related to order execution. Again, the table columns are fixed width to
prevent shifting, and the pagination element is here again, since one user could easily place a lot of orders.

Since there is more than enough space in the widget, let's add another column for actions that can be done on orders as
well. There are 3 actions: copy, modify, and cancel. These do exactly what you think they do. The copy button copies an
order's parameters into a new order form for quick repeating of orders. Modify allows you to change an order that is
pending fulfilment or is fulfilling. Finally, cancel allows you to cancel any pending or fulfilling orders. These are
common actions that I feel like users might want to do on orders. A little design decision here, for modify order, the
amount I prefill to include in the order amount here is the remaining amount yet to be fulfilled, so that the already
fulfilled portion does not get modified by the user.

There are also 3 actions that apply to the table contents at the top right. These are the clear sorting, filter, and
refresh buttons. The order of the effects being applied is filtering first, followed by sorting, and finally by
pagination. This allows filtering to get rid of some items first, reducing the load of sorting, and pagination needs
filtering and ordering results in order to display sorted data, so it comes last.

![Sort](doc_assets/design/orderWidget/sort.png) ![Sort Ascending](doc_assets/design/orderWidget/sortAsc.png) ![Sort Descending](doc_assets/design/orderWidget/sortDesc.png)

The table supports sorting of items based on any column by clicking on the header, and this is communicated to the user
via the arrows beside the table header. The column being actively used for sorting is also differentiated with colour
and underlining to visually show the user that information. The clear sorting button is used to clear any sorting, but
clicking the same header repeatedly also allows the user to toggle their way back to their state.

![Filter](doc_assets/design/orderWidget/filter.png)

The filter button brings up the filter pop up. This pop up allows the user to filter the orders. There is a clear filter
button at the top, and any unpopulated portions in this form simply leave that portion unfiltered. As long as there are
changes to filter values, the user will be placed on page 1 to prevent breaking of pagination by the user being on an
out-of-range page. The filter icon above the table will also be focused to show that the filter is active.

The reload button is the simplest, and simply refetches all orders, with the current filters/sorting/pagination applied.

While the buttons are displayed here, the logic that powers them are actually in the PHP code, and the frontend here
just sends the payload to give the backend information on what we want. While this is a web assignment, I believe having
this logic backend is the better design decision and the frontend should "know" just what it needs.

## Order Form Design

![Order Form](doc_assets/design/orderForm/orderForm.png)

The order form allows users to "place orders". In this case, we have the form on the left, and a details panel on the
right, which displays the same live ticking data that would be present on the expanded instrument tracker widget, just
displayed in a more compact manner with scrolling required.

The form on the left has basic validation and warning messages for wrong values, with the confirm button used to submit
the order disabled on the bottom right until the user has filled valid values. For certain form choices, fields are
disabled as well and values are automatically set if they are invalid for those choices.

This same form is used for copying and modifying orders. With the caveat that we also disable toggling the buy/sell for
modified orders, since it would not make sense for the user to do.

## User Auth Design

![User](doc_assets/design/user/user.png) ![Login](doc_assets/design/user/login.png) ![Create User](doc_assets/design/user/create.png)

For the user and authentication portions, it was purposefully kept simple. Since it was out of scope, it is just a
simple username and password creation/login process, since we are just using it to separate the data by user. In the
cluster of buttons at the top right once logged in, we get to see our username, along with 2 buttons. The first allows
us to set the theming of the app (I really like dark mode, so that was one of the first things I added :P). The latter
is for logging out. This also helped testing since it allowed me to create different users to test different issues,
whether they are related to completely new users or very well used accounts, without resetting my progress in other
accounts.