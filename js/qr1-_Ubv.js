import{p as t,O as e,q as n,t as s,u as i,i as a,e as r,a as o,A as c,c as l,r as u,M as g,E as d,N as p,W as w,S as h,v as S,R as f,Y as C,G as y}from"./lucifer.v7.js";const m=i({status:"uninitialized"}),v={state:m,subscribeKey:(t,e)=>s(m,t,e),subscribe:t=>n(m,()=>t(m)),_getClient(){if(!m._client)throw new Error("SIWEController client not set");return m._client},async getNonce(t){const e=this._getClient(),n=await e.getNonce(t);return this.setNonce(n),n},async getSession(){try{const t=this._getClient(),e=await t.getSession();return e&&(this.setSession(e),this.setStatus("success")),e}catch{return}},createMessage(t){const e=this._getClient().createMessage(t);return this.setMessage(e),e},async verifyMessage(t){const e=this._getClient();return await e.verifyMessage(t)},async signIn(){const t=this._getClient();return await t.signIn()},async signOut(){const t=this._getClient();await t.signOut(),this.setStatus("ready"),this.setSession(void 0),t.onSignOut?.()},onSignIn(t){const e=this._getClient();e.onSignIn?.(t)},onSignOut(){const t=this._getClient();t.onSignOut?.()},setSIWEClient(n){m._client=t(n),m.status="ready",e.setIsSiweEnabled(n.options.enabled)},setNonce(t){m.nonce=t},setStatus(t){m.status=t},setMessage(t){m.message=t},setSession(t){m.session=t,m.status=t?"success":"ready"}},x=a`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--wui-spacing-2xl);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;let b=class extends o{constructor(){super(...arguments),this.dappImageUrl=e.state.metadata?.icons,this.walletImageUrl=c.state.connectedWalletInfo?.icon}firstUpdated(){const t=this.shadowRoot?.querySelectorAll("wui-visual-thumbnail");t?.[0]&&this.createAnimation(t[0],"translate(18px)"),t?.[1]&&this.createAnimation(t[1],"translate(-18px)")}render(){return l`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(t,e){t.animate([{transform:"translateX(0px)"},{transform:e}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};b.styles=x,b=function(t,e,n,s){var i,a=arguments.length,r=a<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,n):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,n,s);else for(var o=t.length-1;o>=0;o--)(i=t[o])&&(r=(a<3?i(r):a>3?i(e,n,r):i(e,n))||r);return a>3&&r&&Object.defineProperty(e,n,r),r}([r("w3m-connecting-siwe")],b);var A=function(t,e,n,s){var i,a=arguments.length,r=a<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,n):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,n,s);else for(var o=t.length-1;o>=0;o--)(i=t[o])&&(r=(a<3?i(r):a>3?i(e,n,r):i(e,n))||r);return a>3&&r&&Object.defineProperty(e,n,r),r};let _=class extends o{constructor(){super(...arguments),this.dappName=e.state.metadata?.name,this.isSigning=!1,this.isCancelling=!1}render(){return this.onRender(),l`
      <wui-flex justifyContent="center" .padding=${["2xl","0","xxl","0"]}>
        <w3m-connecting-siwe></w3m-connecting-siwe>
      </wui-flex>
      <wui-flex
        .padding=${["0","4xl","l","4xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName??"Dapp"} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${["0","3xl","l","3xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["l","xl","xl","xl"]} gap="s" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="main"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?"Signing...":"Sign"}
        </wui-button>
      </wui-flex>
    `}onRender(){v.state.session&&g.close()}async onSign(){this.isSigning=!0,d.sendEvent({event:"CLICK_SIGN_SIWE_MESSAGE",type:"track",properties:{network:p.state.caipNetwork?.id||"",isSmartAccount:c.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}});try{v.setStatus("loading");const t=await v.signIn();return v.setStatus("success"),d.sendEvent({event:"SIWE_AUTH_SUCCESS",type:"track",properties:{network:p.state.caipNetwork?.id||"",isSmartAccount:c.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}}),t}catch(t){const e=c.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT;return e?h.showError("This application might not support Smart Accounts"):h.showError("Signature declined"),v.setStatus("error"),d.sendEvent({event:"SIWE_AUTH_ERROR",type:"track",properties:{network:p.state.caipNetwork?.id||"",isSmartAccount:e}})}finally{this.isSigning=!1}}async onCancel(){this.isCancelling=!0;c.state.isConnected?(await S.disconnect(),g.close()):f.push("Connect"),this.isCancelling=!1,d.sendEvent({event:"CLICK_CANCEL_SIWE",type:"track",properties:{network:p.state.caipNetwork?.id||"",isSmartAccount:c.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}})}};A([u()],_.prototype,"isSigning",void 0),A([u()],_.prototype,"isCancelling",void 0),_=A([r("w3m-connecting-siwe-view")],_);export{v as SIWEController,b as W3mConnectingSiwe,_ as W3mConnectingSiweView,C as getDidAddress,y as getDidChainId};
