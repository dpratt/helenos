/* ************************************************************************
Copyright:
  2012 Tomek Kuprowski
License:
  GPLv2: http://www.gnu.org/licences/gpl.html
Authors:
  Tomek Kuprowski (tomekkuprowski at gmail dot com)
 ************************************************************************ */
/* ************************************************************************
#asset(helenos/*)
#asset(favicon.ico)
#asset(ZeroClipboard*.*)
************************************************************************ */

/**
 * This is the main application class of your custom application "helenos"
 */
qx.Class.define("helenos.Application",
{
    extend : qx.application.Standalone,

    members :
    {
        _loginBox : null,
        
        /** 
        * @lint ignoreUndefined(silverbluetheme)
        */
        main : function()
        {
            this.base(arguments);
            // set default locale
            qx.locale.Manager.getInstance().setLocale("en");
            
            ZeroClipboard.setMoviePath("resource/ZeroClipboard10.swf");
            // apply MTableContextMenu mixin to TreeVirtual and Table to enable context menu
            qx.Class.include(qx.ui.treevirtual.TreeVirtual, qx.ui.table.MTableContextMenu);
            qx.Class.include(helenos.ui.table.Table, qx.ui.table.MTableContextMenu);

            // Enable logging in debug variant
            //if (qx.core.Environment.get("qx.debug"))
            {
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console. Press F7 to toggle visibility
                qx.log.appender.Console;
            }
            // ask for credentials
            this.initLoginBox();
            //this.initLoginBoxFAKE();
        },
        
        initLoginBoxFAKE : function() {
           this.checkCredentials('admin', '123', function(foo1, foo2){
               qx.core.Init.getApplication().getRoot().add(new helenos.components.TopComposite(), {edge : 0});
           }, this);
        },
        
        initLoginBox : function() {
            this._loginBox = new dialog.Login({
                "text" : 'Enter your credentials...',
                "image" : "helenos/logobw.png",
                checkCredentials : this.checkCredentials
            });
            
            this._loginBox.addListener('loginSuccess', function() {
                this.getRoot().add(new helenos.components.TopComposite(), {edge : 0});
            }, this);
            this._loginBox.addListener('loginFailure', function() {
                qx.bom.element.Animation.animate(this._loginBox.getContainerElement().getDomElement(), this.shake, 1000);
            }, this);
            this._loginBox.show();
        },
        
        checkCredentials : function(username, password, callback ) {
            var req = new qx.io.remote.Request(helenos.util.UriHelper.getRemoteUri('/j_spring_security_check'), 'POST', 'application/json');
            req.set({
                parseJson : true, 
                prohibitCaching : true
            });
            req.setParameter('j_username', username, true);
            req.setParameter('j_password', password, true);
            req.addListener("completed", function(e) {
                helenos.util.CredentialsProvider.registerLoggedUser(username, e.getContent());
                callback(e.getContent() == null, username);
            }, this);
            
            req.send();
        }
    }
});
